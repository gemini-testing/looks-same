'use strict';
var fs = require('fs'),
    PNG = require('pngjs').PNG,
    parseColor = require('parse-color'),
    colorDiff = require('color-diff');

function readPNG(path, callback) {
    var png = new PNG({
        filterType: -1
    });
    var src = fs.createReadStream(path);

    png.on('parsed', function() {
        callback(null, png);
    });

    png.on('error', function(error) {
        callback(error, null);
    });
    src.pipe(png);
}

function parseBuffer(buffer, callback) {
    var png = new PNG({
        filterType: -1
    });
    png.parse(buffer, callback);
}

function readPair(first, second, callback) {
    var src = {first: first, second: second},
        result = {first: null, second: null},
        read = 0,
        failed = false;

    ['first', 'second'].forEach(function(key) {
        var source = src[key],
            readFunc = Buffer.isBuffer(source)? parseBuffer : readPNG;

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

function processRow(png1, png2, row) {
}

function forEachPixelPair(png1, png2, callback) {
    var width = Math.min(png1.width, png2.width),
        height = Math.min(png1.height, png2.height);

    outer:
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var idx = (width * y + x) * 4,
                color1 = {
                    R: png1.data[idx],
                    G: png1.data[idx + 1],
                    B: png1.data[idx + 2]
                },
                color2 = {
                    R: png2.data[idx],
                    G: png2.data[idx + 1],
                    B: png2.data[idx + 2]
                };
            if (callback(color1, color2, idx)) {
                break outer;
            }
        }
    }
}

function arePNGsLookSame(png1, png2) {
    if (png1.width !== png2.width || png1.height !== png2.height) {
        return false;
    }
    var result = true;
    forEachPixelPair(png1, png2, function(color1, color2) {
        if (!areColorsLookSame(color1, color2)) {
            result = false;
            return true;
        }
    });
    return result;
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
        callback(null, arePNGsLookSame(result.first, result.second));
    });
};

function buildDiffStream(png1, png2, options) {
    var width = Math.max(png1.width, png2.width),
        height = Math.max(png1.height, png2.height),
        highlightColor = options.highlightColor,
        result = new PNG({
            width: width,
            height: height
        });

    forEachPixelPair(png1, png2, function(color1, color2, idx) {
        if (!areColorsLookSame(color1, color2)) {
            result.data[idx] = highlightColor.R;
            result.data[idx + 1] = highlightColor.G;
            result.data[idx + 2] = highlightColor.B;
            result.data[idx + 3] = 255;
        } else {
            result.data[idx] = color1.R;
            result.data[idx + 1] = color1.G;
            result.data[idx + 2] = color1.B;
            result.data[idx + 3] = 255;
        }
    });
    return result.pack();
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
        var diffOptions = {
                highlightColor: parseColorString(opts.highlightColor)
            },
            stream = buildDiffStream(result.first, result.second, diffOptions),
            writeStream = fs.createWriteStream(opts.diff);
        stream.pipe(writeStream);

        writeStream.on('error', function(error) {
            callback(error);
        });
        writeStream.on('finish', function() {
            callback(null);
        });
    });
};
