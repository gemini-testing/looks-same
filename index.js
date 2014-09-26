'use strict';
var fs = require('fs'),
    parseColor = require('parse-color'),
    colorDiff = require('color-diff'),
    PNGImage = require('./png');

function readPair(first, second, callback) {
    var src = {first: first, second: second},
        result = {first: null, second: null},
        read = 0,
        failed = false;

    ['first', 'second'].forEach(function(key) {
        var source = src[key],
            readFunc = Buffer.isBuffer(source)? PNGImage.fromBuffer : PNGImage.fromFile;

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

function forEachPixelPair(png1, png2, pixelCallback, endCallback) {
    var width = Math.min(png1.width, png2.width),
        height = Math.min(png1.height, png2.height),

        processRow = function processRow(y) {
            setImmediate(function() {
                for (var x = 0; x < width; x++) {
                    var color1 = png1.getPixel(x, y),
                        color2 = png2.getPixel(x, y);
                    pixelCallback(color1, color2, x, y);
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
}

function arePNGsLookSame(png1, png2, callback) {
    if (png1.width !== png2.width || png1.height !== png2.height) {
        return process.nextTick(function() {
            callback(false);
        });
    }
    var result = true;
    forEachPixelPair(png1, png2, function(color1, color2) {
        if (!areColorsLookSame(color1, color2)) {
            result = false;
            return true;
        }
    }, function() {
        callback(result);
    });
}

function areColorsLookSame(c1, c2) {
    if (areColorsSame(c1, c2)) {
        return true;
    }
    /*jshint camelcase:false*/
    var lab1 = colorDiff.rgb_to_lab(c1),
        lab2 = colorDiff.rgb_to_lab(c2);

    return colorDiff.diff(lab1, lab2) < 2.3;
}

function areColorsSame(c1, c2) {
    return c1.R === c2.R &&
        c1.G === c2.G,
        c1.B === c2.B;
}

module.exports = exports = function looksSame(reference, image, callback) {
    readPair(reference, image, function(error, result) {
        if (error) {
            return callback(error, null);
        }

        arePNGsLookSame(result.first, result.second, function(result) {
            callback(null, result);
        });
    });
};

function buildDiffImage(png1, png2, options, callback) {
    var width = Math.max(png1.width, png2.width),
        height = Math.max(png1.height, png2.height),
        highlightColor = options.highlightColor,
        result = PNGImage.createSync(width, height);

    forEachPixelPair(png1, png2, function(color1, color2, x, y) {
        if (!areColorsLookSame(color1, color2)) {
            result.setPixel(x, y, highlightColor);
        } else {
            result.setPixel(x, y, color1);
        }
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
