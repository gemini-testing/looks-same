'use strict';
var parseColor = require('parse-color'),
    colorDiff = require('color-diff'),
    png = require('./png'),
    PNGIn = png.PNGIn,
    PNGOut = png.PNGOut;

var JND = 2.3; //Just noticable difference
                //if ciede2000 >= JND then colors
                //difference is noticable by human eye

function readPair(first, second, callback) {
    var src = {first: first, second: second},
        result = {first: null, second: null},
        read = 0,
        failed = false;

    ['first', 'second'].forEach(function(key) {
        var source = src[key],
            readFunc = Buffer.isBuffer(source)? PNGIn.fromBuffer : PNGIn.fromFile;

        readFunc(source, function(error, png) {
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
}

function everyPixelPair(png1, png2, predicate, endCallback) {
    var width = Math.min(png1.width, png2.width),
        height = Math.min(png1.height, png2.height),

        processRow = function processRow(y) {
            setImmediate(function() {
                for (var x = 0; x < width; x++) {
                    var color1 = png1.getPixel(x, y),
                        color2 = png2.getPixel(x, y),
                        result = predicate(color1, color2, x, y);

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

function arePNGsLookSame(png1, png2, opts, callback) {
    if (png1.width !== png2.width || png1.height !== png2.height) {
        return process.nextTick(function() {
            callback(false);
        });
    }

    var comparator = opts.strict? areColorsSame : areColorsLookSame;
    if (opts.ignoreCaret) {
        comparator = makeNoCaretColorComparator(comparator);
    }

    everyPixelPair(png1, png2, comparator, callback);
}

function makeNoCaretColorComparator(comparator) {
    var prevFailure = null;
    return function compareNoCaret(color1, color2, x, y) {
        if (comparator(color1, color2)) {
            return true;
        }

        if (prevFailure) {
            if (x !== prevFailure.x || y !== prevFailure.y + 1) {
                return false;
            }
        }
        prevFailure = {x: x, y: y};
        return true;
    };
}

function areColorsLookSame(c1, c2) {
    if (areColorsSame(c1, c2)) {
        return true;
    }
    /*jshint camelcase:false*/
    var lab1 = colorDiff.rgb_to_lab(c1),
        lab2 = colorDiff.rgb_to_lab(c2);

    return colorDiff.diff(lab1, lab2) < JND;
}

function areColorsSame(c1, c2) {
    return c1.R === c2.R &&
        c1.G === c2.G,
        c1.B === c2.B;
}

module.exports = exports = function looksSame(reference, image, opts, callback) {
    if (!callback) {
        callback = opts;
        opts = {};
    }
    readPair(reference, image, function(error, result) {
        if (error) {
            return callback(error, null);
        }

        arePNGsLookSame(result.first, result.second, opts, function(result) {
            callback(null, result);
        });
    });
};

function buildDiffImage(png1, png2, options, callback) {
    var width = Math.max(png1.width, png2.width),
        height = Math.max(png1.height, png2.height),
        highlightColor = options.highlightColor,
        result = new PNGOut(width, height);

    everyPixelPair(png1, png2, function(color1, color2, x, y) {
        if (!areColorsLookSame(color1, color2)) {
            result.setPixel(x, y, highlightColor);
        } else {
            result.setPixel(x, y, color1);
        }
        return true;
    }, function() {
        callback(result);
    });
}

function parseColorString(str) {
    var parsed = parseColor(str);
    return {
        R: parsed.rgb[0],
        G: parsed.rgb[1],
        B: parsed.rgb[2]
    };
}

exports.saveDiff = function saveDiff(opts, callback) {
    readPair(opts.reference, opts.current, function(error, result) {
        if (error) {
            return callback(error);
        }
        var diffOptions = {
                highlightColor: parseColorString(opts.highlightColor)
            };

        buildDiffImage(result.first, result.second, diffOptions, function(result) {
            result.save(opts.diff, callback);
        });
    });
};
