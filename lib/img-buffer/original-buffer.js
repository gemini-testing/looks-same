'use strict';

const IMGBuffer = require('./buffer');

const IMG_WIDTH_OFFSET = 16;
const IMG_HEIGHT_OFFSET = 20;

module.exports = class OriginalIMGBuffer extends IMGBuffer {
    getActualCoord(x, y) {
        return {x, y};
    }

    get width() {
        return this._buffer.readUInt32BE(IMG_WIDTH_OFFSET);
    }

    get height() {
        return this._buffer.readUInt32BE(IMG_HEIGHT_OFFSET);
    }
};
