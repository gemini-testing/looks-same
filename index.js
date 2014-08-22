'use strict';
var fs = require('fs'),
    PNG = require('pngjs').PNG,
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

function arePNGsLookSame(png1, png2) {
    if (png1.width !== png2.width || png1.height !== png2.height) {
        return false;
    }
    var width = png1.width,
        height = png1.height;

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

            if (!areColorsLookSame(color1, color2)) {
                return false;
            }
        }
    }

    return true;
}

function areColorsLookSame(c1, c2) {
    /*jshint camelcase:false*/
    var lab1 = colorDiff.rgb_to_lab(c1),
        lab2 = colorDiff.rgb_to_lab(c2);

    return colorDiff.diff(lab1, lab2) < 2.3;
}

module.exports = function looksSame(reference, image, callback) {
    readPair(reference, image, function(error, result) {
        if (error) {
            return callback(error, null);
        }
        callback(null, arePNGsLookSame(result.first, result.second));
    });
};
