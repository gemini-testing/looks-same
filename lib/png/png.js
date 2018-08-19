'use strict';

module.exports = class PngBase {
    constructor(pngInst) {
        this._png = pngInst;
    }

    getPixel() {
        throw new Error('Not implemented');
    }

    setPixel() {
        throw new Error('Not implemented');
    }

    get width() {
        throw new Error('Not implemented');
    }

    get height() {
        throw new Error('Not implemented');
    }

    save() {
        throw new Error('Not implemented');
    }

    createBuffer() {
        throw new Error('Not implemented');
    }
};
