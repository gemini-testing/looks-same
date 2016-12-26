'use strict';

const _ = require('lodash');
const parseColor = require('parse-color');
const colorDiff = require('color-diff');
const png = require('./lib/png');
const areColorsSame = require('./lib/same-colors');
const AntialiasingComparator = require('./lib/antialiasing-comparator');
const IgnoreCaretComparator = require('./lib/ignore-caret-comparator');

const JND = 2.3; //Just noticable difference
                //if ciede2000 >= JND then colors
                //difference is noticable by human eye

const readPair = (first, second, callback) => {
    const src = {first, second};
    const result = {first: null, second: null};

    let read = 0;
    let failed = false;

    ['first', 'second'].forEach((key) => {
        const source = src[key];
        const readFunc = Buffer.isBuffer(source) ? png.fromBuffer : png.fromFile;

        readFunc(source, (error, png) => {
            if (failed) {
                return;
            }

            if (error) {
                failed = true;
                return callback(error, null);
            }

            result[key] = png;
            read++;

            if (read === 2) {
                callback(null, result);
            }
        });
    });
};

const everyPixelPair = (png1, png2, predicate, endCallback) => {
    const width = Math.min(png1.width, png2.width);
    const height = Math.min(png1.height, png2.height);

    const processRow = (y) => {
        setImmediate(() => {
            for (let x = 0; x < width; x++) {
                const color1 = png1.getPixel(x, y);
                const color2 = png2.getPixel(x, y);

                const result = predicate({
                    color1, color2,
                    png1, png2,
                    x, y,
                    width, height
                });

                if (!result) {
                    return endCallback(false);
                }
            }
            y++;

            if (y < height) {
                processRow(y);
            } else {
                endCallback(true);
            }
        });
    };

    processRow(0);
}

const arePNGsLookSame = (png1, png2, opts, callback) => {
    if (png1.width !== png2.width || png1.height !== png2.height) {
        return process.nextTick(() => callback(false));
    }

    let comparator = opts.strict ? areColorsSame : makeCIEDE2000Comparator(opts.tolerance);

    if (opts.ignoreAntialiasing) {
        comparator = makeAntialiasingComparator(comparator, png1, png2);
    }

    if (opts.ignoreCaret) {
        comparator = makeNoCaretColorComparator(comparator, opts.pixelRatio);
    }

    everyPixelPair(png1, png2, comparator, callback);
};

const makeAntialiasingComparator = (comparator, png1, png2) => {
    const antialiasingComparator = new AntialiasingComparator(comparator, png1, png2);
    return (data) => antialiasingComparator.compare(data);
};

const makeNoCaretColorComparator = (comparator, pixelRatio) => {
    const caretComparator = new IgnoreCaretComparator(comparator, pixelRatio);
    return (data) => caretComparator.compare(data);
};

function makeCIEDE2000Comparator(tolerance) {
    return function doColorsLookSame(data) {
        if (areColorsSame(data)) {
            return true;
        }
        /*jshint camelcase:false*/
        const lab1 = colorDiff.rgb_to_lab(data.color1);
        const lab2 = colorDiff.rgb_to_lab(data.color2);

        return colorDiff.diff(lab1, lab2) < tolerance;
    };
}

const iterateRect = (width, height, callback, endCallback) => {
    const processRow = (y) => {
        setImmediate(() => {
            for (let x = 0; x < width; x++) {
                callback(x, y);
            }

            y++;

            if (y < height) {
                processRow(y);
            } else {
                endCallback();
            }
        });
    };

    processRow(0);
};

const buildDiffImage = (png1, png2, options, callback) => {
    const width = Math.max(png1.width, png2.width);
    const height = Math.max(png1.height, png2.height);
    const minWidth = Math.min(png1.width, png2.width);
    const minHeight = Math.min(png1.height, png2.height);
    const highlightColor = options.highlightColor;
    const result = png.empty(width, height);

    iterateRect(width, height, (x, y) => {
        if (x >= minWidth || y >= minHeight) {
            result.setPixel(x, y, highlightColor);
            return;
        }

        const color1 = png1.getPixel(x, y);
        const color2 = png2.getPixel(x, y);

        if (!options.comparator({color1, color2})) {
            result.setPixel(x, y, highlightColor);
        } else {
            result.setPixel(x, y, color1);
        }
    }, () => callback(result));
};

const parseColorString = (str) => {
    const parsed = parseColor(str);

    return {
        R: parsed.rgb[0],
        G: parsed.rgb[1],
        B: parsed.rgb[2]
    };
};

const getToleranceFromOpts = (opts) => {
    if (!_.hasIn(opts, 'tolerance')) {
        return JND;
    }

    if (opts.strict) {
        throw new TypeError('Unable to use "strict" and "tolerance" options together');
    }

    return opts.tolerance;
};

module.exports = exports = function looksSame(reference, image, opts, callback) {
    if (!callback) {
        callback = opts;
        opts = {};
    }

    opts.tolerance = getToleranceFromOpts(opts);

    if (opts.ignoreAntialiasing === undefined) {
        opts.ignoreAntialiasing = true;
    }

    readPair(reference, image, (error, result) => {
        if (error) {
            return callback(error, null);
        }

        arePNGsLookSame(result.first, result.second, opts, (result) => callback(null, result));
    });
};

exports.createDiff = function saveDiff(opts, callback) {
    const tolerance = getToleranceFromOpts(opts);

    readPair(opts.reference, opts.current, (error, result) => {
        if (error) {
            return callback(error);
        }

        const diffOptions = {
            highlightColor: parseColorString(opts.highlightColor),
            comparator: opts.strict ? areColorsSame : makeCIEDE2000Comparator(tolerance)
        };

        buildDiffImage(result.first, result.second, diffOptions, (result) => {
            if (opts.diff === undefined) {
                result.createBuffer(callback);
            } else {
                result.save(opts.diff, callback);
            }
        });
    });
};

exports.colors = (color1, color2, opts) => {
    opts = opts || {};

    if (opts.tolerance === undefined) {
        opts.tolerance = JND;
    }

    const comparator = makeCIEDE2000Comparator(opts.tolerance);

    return comparator({color1, color2});
};
