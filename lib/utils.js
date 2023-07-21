'use strict';

const _ = require('lodash');
const parseColor = require('parse-color');
const img = require('./image');
const buffer = require('./img-buffer');
const DiffArea = require('./diff-area');
const DiffClusters = require('./diff-clusters');
const validators = require('./validators');
const areColorsSame = require('./same-colors');
const {DIFF_IMAGE_CHANNELS} = require('./constants');

exports.readImgCb = async ({source, ...opts}) => {
    const readFunc = Buffer.isBuffer(source) ? img.fromBuffer : img.fromFile;
    const image = await readFunc(source, opts);

    await image.init();

    return image;
};

exports.readBufferCb = ({source, ...opts}) => {
    const readFunc = Buffer.isBuffer(source) ? buffer.create : buffer.fromFile;
    return readFunc(source, opts);
};

exports.readPair = async (first, second, readCb = exports.readImgCb) => {
    const [firstImg, secondImg] = await Promise.all([first, second].map(readCb));

    return {first: firstImg, second: secondImg};
};

const getDiffClusters = (diffClusters, diffArea, {shouldCluster}) => {
    return shouldCluster ? diffClusters.clusters : [diffArea.area];
};

exports.getDiffPixelsCoords = async (img1, img2, predicate, opts = {}) => {
    const stopOnFirstFail = opts.hasOwnProperty('stopOnFirstFail') ? opts.stopOnFirstFail : false;

    const width = Math.min(img1.width, img2.width);
    const height = Math.min(img1.height, img2.height);

    const diffArea = new DiffArea();
    const diffClusters = new DiffClusters(opts.clustersSize);

    return new Promise((resolve) => {
        const processRow = (y) => {
            setImmediate(() => {
                for (let x = 0; x < width; x++) {
                    const color1 = img1.getPixel(x, y);
                    const color2 = img2.getPixel(x, y);

                    const result = predicate({
                        color1, color2,
                        img1, img2,
                        x, y,
                        width, height
                    });

                    if (!result) {
                        const {x: actX, y: actY} = img1.getActualCoord(x, y);
                        diffArea.update(actX, actY);
                        if (opts.shouldCluster) {
                            diffClusters.update(actX, actY);
                        }

                        if (stopOnFirstFail) {
                            return resolve({diffArea, diffClusters: getDiffClusters(diffClusters, diffArea, opts)});
                        }
                    }
                }

                y++;

                if (y < height) {
                    processRow(y);
                } else {
                    resolve({diffArea, diffClusters: getDiffClusters(diffClusters, diffArea, opts)});
                }
            });
        };

        processRow(0);
    });
};

exports.formatImages = (img1, img2) => {
    validators.validateImages(img1, img2);

    return [img1, img2].map((i) => {
        return _.isObject(i) && !Buffer.isBuffer(i) ? i : {source: i, boundingBox: null};
    });
};

exports.areBuffersEqual = (img1, img2) => {
    if (img1.boundingBox || img2.boundingBox) {
        return false;
    }

    return img1.buffer.equals(img2.buffer);
};

exports.parseColorString = (str) => {
    const parsed = parseColor(str || '#ff00ff');

    return {
        R: parsed.rgb[0],
        G: parsed.rgb[1],
        B: parsed.rgb[2]
    };
};

exports.calcDiffImage = async (img1, img2, comparator, {highlightColor, shouldCluster, clustersSize}) => {
    const diffColor = exports.parseColorString(highlightColor);

    const minHeight = Math.min(img1.height, img2.height);
    const minWidth = Math.min(img1.width, img2.width);

    const maxHeight = Math.max(img1.height, img2.height);
    const maxWidth = Math.max(img1.width, img2.width);

    const totalPixels = maxHeight * maxWidth;
    const metaInfo = {refImg: {size: {width: img1.width, height: img1.height}}};

    const diffBuffer = Buffer.alloc(maxHeight * maxWidth * DIFF_IMAGE_CHANNELS);
    const diffArea = new DiffArea();
    const diffClusters = new DiffClusters(clustersSize);

    let differentPixels = 0;
    let diffBufferPos = 0;

    const markDiff = (x, y) => {
        diffBuffer[diffBufferPos++] = diffColor.R;
        diffBuffer[diffBufferPos++] = diffColor.G;
        diffBuffer[diffBufferPos++] = diffColor.B;
        differentPixels++;

        diffArea.update(x, y);
        if (shouldCluster) {
            diffClusters.update(x, y);
        }
    };

    for (let y = 0; y < maxHeight; y++) {
        for (let x = 0; x < maxWidth; x++) {
            if (y > minHeight || x > minWidth) {
                markDiff(x, y); // Out of bounds pixels considered as diff
                continue;
            }

            const color1 = img1.getPixel(x, y);
            const color2 = img2.getPixel(x, y);

            const areSame = areColorsSame({color1, color2}) || comparator({
                img1,
                img2,
                x,
                y,
                color1,
                color2,
                width: maxWidth,
                height: maxHeight,
                minWidth,
                minHeight
            });

            if (areSame) {
                diffBuffer[diffBufferPos++] = color2.R;
                diffBuffer[diffBufferPos++] = color2.G;
                diffBuffer[diffBufferPos++] = color2.B;
            } else {
                markDiff(x, y);
            }
        }

        // eslint-disable-next-line no-bitwise
        if (!(y & 0xff)) { // Release event queue every 256 rows
            await new Promise(setImmediate);
        }
    }

    let diffImage = null;

    if (differentPixels) {
        diffImage = await img.fromBuffer(diffBuffer, {raw: {width: maxWidth, height: maxHeight, channels: DIFF_IMAGE_CHANNELS}});
        await diffImage.initMeta();
    }

    return {
        equal: !differentPixels,
        metaInfo,
        diffImage,
        differentPixels,
        totalPixels,
        diffBounds: diffArea.area,
        diffClusters: diffClusters.clusters
    };
};
