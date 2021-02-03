'use strict';

const PNGBase = require('../png-base');

module.exports = class PNGBuffer extends PNGBase {
    constructor(buffer) {
        super();

        this._buffer = buffer;
    }

    get buffer() {
        return this._buffer;
    }
};
