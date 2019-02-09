'use strict';

const fs = require('fs');
const {PNG} = require('pngjs');
const OriginalPNG = require('./original-png');
const BoundedPNG = require('./bounded-png');

exports.create = (png, {boundingBox} = {}) => {
    return boundingBox
        ? BoundedPNG.create(png, boundingBox)
        : OriginalPNG.create(png);
};

exports.fromFile = (filePath, opts = {}, callback) => {
    fs.readFile(filePath, (error, data) => {
        error
            ? callback(error, null)
            : exports.fromBuffer(data, opts, callback);
    });
};

exports.fromBuffer = (buffer, opts = {}, callback) => {
    const png = new PNG();
    png.parse(buffer, (error) => {
        error
            ? callback(error, null)
            : callback(null, exports.create(png, opts));
    });
};

exports.empty = (width, height) => exports.create(new PNG({width, height}));
