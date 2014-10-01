'use strict';
var fs = require('fs'),
    pngparse = require('pngparse'),
    PNG = require('pngjs').PNG;

function PNGIn(data) {
    this._data = data;
}

PNGIn.prototype = {
    constructor: PNGIn,

    getPixel: function(x, y) {
        var pixel = this._data.getPixel(x, y);
        return {
            R: (pixel & 0xFF000000) >>> 24,
            G: (pixel & 0x00FF0000) >>> 16,
            B: (pixel & 0x0000FF00) >>> 8
        };
    },

    get width() {
        return this._data.width;
    },

    get height() {
        return this._data.height;
    }

};

PNGIn.fromFile = function fromFile(filePath, callback) {
    pngparse.parseFile(filePath, function(error, data) {
        if (error) {
            return callback(error, null);
        }
        callback(null, new PNGIn(data));
    });
};

PNGIn.fromBuffer = function fromBuffer(buffer, callback) {
    pngparse.parse(buffer, function(error, data) {
        if (error) {
            return callback(error, null);
        }
        callback(null, new PNGIn(data));
    });
};

exports.PNGIn = PNGIn;

function PNGOut(width, height) {
    this._png = new PNG({
        width: width,
        height: height
    });
}

PNGOut.prototype = {
    constructor: PNGOut,

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
    }
};

exports.PNGOut = PNGOut;
