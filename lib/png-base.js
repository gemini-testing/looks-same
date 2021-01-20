'use strict';

module.exports = class PNGBase {
    static create(...args) {
        return new this(...args);
    }

    getActualCoord() {
        throw new Error('Not implemented');
    }

    get width() {
        throw new Error('Not implemented');
    }

    get height() {
        throw new Error('Not implemented');
    }
};
