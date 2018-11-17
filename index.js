'use strict';

const _ = require('lodash');
const parseColor = require('parse-color');
const colorDiff = require('color-diff');
const png = require('./lib/png');
const areColorsSame = require('./lib/same-colors');
const AntialiasingComparator = require('./lib/antialiasing-comparator');
const IgnoreCaretComparator = require('./lib/ignore-caret-comparator');
const utils = require('./lib/utils');
const readPair = utils.readPair;
const getDiffPixelsCoords = utils.getDiffPixelsCoords;

const JND = 2.3; // Just noticeable difference if ciede2000 >= JND then colors difference is noticeable by human eye

const getDiffArea = (diffPixelsCoords) => {
    const xs = [];
    const ys = [];

    diffPixelsCoords.forEach((coords) => {
        xs.push(coords[0]);
        ys.push(coords[1]);
    });

    const top = Math.min.apply(Math, ys);
    const bottom = Math.max.apply(Math, ys);

    const left = Math.min.apply(Math, xs);
    const right = Math.max.apply(Math, xs);

    const width = (right - left) + 1;
    const height = (bottom - top) + 1;

    return {left, top, width, height};
};

const makeAntialiasingComparator = (comparator, png1, png2, opts) => {
    const antialiasingComparator = new AntialiasingComparator(comparator, png1, png2, opts);
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

const createComparator = (png1, png2, opts) => {
    let comparator = opts.strict ? areColorsSame : makeCIEDE2000Comparator(opts.tolerance);

    if (opts.ignoreAntialiasing) {
        comparator = makeAntialiasingComparator(comparator, png1, png2, opts);
    }

    if (opts.ignoreCaret) {
        comparator = makeNoCaretColorComparator(comparator, opts.pixelRatio);
    }

    return comparator;
};

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

        if (!options.comparator({color1, color2, png1, png2, x, y, width, height})) {
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

const prepareOpts = (opts) => {
    opts.tolerance = getToleranceFromOpts(opts);

    _.defaults(opts, {
        ignoreAntialiasing: true,
        antialiasingTolerance: 0
    });
};

module.exports = exports = function looksSame(reference, image, opts, callback) {
    if (!callback) {
        callback = opts;
        opts = {};
    }

    prepareOpts(opts);

    readPair(reference, image, (error, pair) => {
        if (error) {
            return callback(error);
        }

        const first = pair.first;
        const second = pair.second;

        if (first.width !== second.width || first.height !== second.height) {
            return process.nextTick(() => callback(null, false));
        }

        const comparator = createComparator(first, second, opts);

        getDiffPixelsCoords(first, second, comparator, {stopOnFirstFail: true}, (result) => {
            callback(null, result.length === 0);
        });
    });
};

exports.getDiffArea = function(reference, image, opts, callback) {
    if (!callback) {
        callback = opts;
        opts = {};
    }

    prepareOpts(opts);

    readPair(reference, image, (error, pair) => {
        if (error) {
            return callback(error);
        }

        const first = pair.first;
        const second = pair.second;

        if (first.width !== second.width || first.height !== second.height) {
            return process.nextTick(() => callback(null, {
                width: Math.max(first.width, second.width),
                height: Math.max(first.height, second.height),
                top: 0,
                left: 0
            }));
        }

        const comparator = createComparator(first, second, opts);

        getDiffPixelsCoords(first, second, comparator, (result) => {
            if (!result.length) {
                return callback(null, null);
            }

            callback(null, getDiffArea(result));
        });
    });
};

exports.createDiff = function saveDiff(opts, callback) {
    opts.tolerance = getToleranceFromOpts(opts);

    readPair(opts.reference, opts.current, (error, {first, second}) => {
        if (error) {
            return callback(error);
        }

        const diffOptions = {
            highlightColor: parseColorString(opts.highlightColor),
            comparator: createComparator(first, second, opts)
        };

        buildDiffImage(first, second, diffOptions, (result) => {
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
