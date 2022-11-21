'use strict';

const ImageBase = require('../image-base');

module.exports = class IMGBuffer extends ImageBase {
    constructor(buffer) {
        super();

        this._buffer = buffer;
    }

    get buffer() {
        return this._buffer;
    }
};
