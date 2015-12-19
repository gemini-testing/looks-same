'use strict';
var fs = require('fs'),
    PNG = require('pngjs').PNG,
    concat = require('concat-stream');

function PNGImage(png) {
    this._png = png;
}

PNGImage.prototype = {
    constructor: PNGImage,

    getPixel: function(x, y) {
        var idx = this._getIdx(x, y);
        return {
            R: this._png.data[idx],
            G: this._png.data[idx + 1],
            B: this._png.data[idx + 2]
        };
    },

    get width() {
        return this._png.width;
    },

    get height() {
        return this._png.height;
    },

    setPixel: function(x, y, color) {
        var idx = this._getIdx(x, y);
        this._png.data[idx] = color.R;
        this._png.data[idx + 1] = color.G;
        this._png.data[idx + 2] = color.B;
        this._png.data[idx + 3] = 255;
    },

    _getIdx: function(x, y) {
        return (this._png.width * y + x) * 4;
    },

    save: function(path, callback) {
        var writeStream = fs.createWriteStream(path);
        this._png.pack().pipe(writeStream);
        writeStream.on('error', function(error) {
            callback(error);
        });
        writeStream.on('finish', function() {
            callback(null);
        });
    },

    createBuffer: function(callback) {
        this._png.pack().pipe(concat(gotDiff));

        this._png.on('error', function(error) {
            callback(error, null);
        });

        function gotDiff(data) {
            callback(null, data);
        }
    }
};

exports.fromFile = function fromFile(filePath, callback) {
    var png = new PNG();
    fs.createReadStream(filePath)
        .pipe(png)
        .on('parsed', function() {
            callback(null, new PNGImage(png));
        })
        .on('error', callback);
};

exports.fromBuffer = function fromBuffer(buffer, callback) {
    var png = new PNG();
    png.parse(buffer, function(error, data) {
        if (error) {
            return callback(error, null);
        }
        callback(null, new PNGImage(png));
    });
};

exports.empty = function empty(width, height) {
    return new PNGImage(new PNG({
        width: width,
        height: height
    }));
};
