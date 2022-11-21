'use strict';

const _ = require('lodash');
const img = require('./image');
const buffer = require('./img-buffer');
const DiffArea = require('./diff-area');
const DiffClusters = require('./diff-clusters');
const validators = require('./validators');

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
