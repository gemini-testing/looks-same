'use strict';
var fs = require('fs'),
    lodepng = require('lodepng');

function getIdx(imageData, x, y) {
  return (imageData.width * y + x) * 4;
}

function getPixel(imageData, x, y) {
    var idx = getIdx(imageData, x, y);
    return {
        R: imageData.data[idx],
        G: imageData.data[idx + 1],
        B: imageData.data[idx + 2]
    };
}

function PNGIn(imageData) {
    this.width = imageData.width;
    this.height = imageData.height;
    this.data = imageData.data;
}

PNGIn.prototype = {
    constructor: PNGIn,

    getPixel: function(x, y) {
        return getPixel(this, x, y);
    }
};

PNGIn.fromFile = function fromFile(filePath, callback) {
    fs.readFile(filePath, function (err, raw) {
      if (err) return callback(err);

      PNGIn.fromBuffer(raw, callback);
    });
};

PNGIn.fromBuffer = function fromBuffer(buffer, callback) {
    lodepng.decode(buffer, function (err, imageData) {
      if (err) return callback(err);

      callback(null, new PNGIn(imageData));
    });
};

exports.PNGIn = PNGIn;

function PNGOut(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
}

PNGOut.prototype = {
    constructor: PNGOut,

    getPixel: function(x, y) {
        return getPixel(this, x, y);
    },

    setPixel: function(x, y, color) {
        var idx = getIdx(this, x, y);
        this.data[idx] = color.R;
        this.data[idx + 1] = color.G;
        this.data[idx + 2] = color.B;
        this.data[idx + 3] = 255;
    },

    save: function(path, callback) {
        lodepng.encode(this, function (err, raw) {
            if (err) return callback(err);

            fs.writeFile(path, raw, callback);
        });
    },

    createBuffer: function(callback) {
        lodepng.encode(this, callback);
    }
};

exports.PNGOut = PNGOut;
