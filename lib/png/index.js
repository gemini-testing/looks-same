'use strict';

const {PNG: PngJs} = require('pngjs');
const PngJsWrapper = require('./pngjs');
const PngImgWrapper = require('./png-img');

exports.create = (source, cb) => {
    if (Buffer.isBuffer(source)) {
        PngJsWrapper.fromBuffer(source, cb);
        return;
    }

    if (typeof source === 'string') {
        PngJsWrapper.fromFile(source, cb);
        return;
    }

    cb(null, PngImgWrapper.create(source));
};

exports.empty = (width, height) => PngJsWrapper.create(new PngJs({width, height}));
