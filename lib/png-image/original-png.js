'use strict';

const PNGImage = require('./png');

module.exports = class OriginalPNGImage extends PNGImage {
    getActualCoord(x, y) {
        return {x, y};
    }

    get width() {
        return this._png.width;
    }

    get height() {
        return this._png.height;
    }
};
