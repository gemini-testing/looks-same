'use strict';

const Image = require('./image');

module.exports = class OriginalImage extends Image {
    getActualCoord(x, y) {
        return {x, y};
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }
};
