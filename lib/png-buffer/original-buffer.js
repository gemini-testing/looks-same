'use strict';

const PNGBuffer = require('./buffer');

const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;

module.exports = class OriginalPNGBuffer extends PNGBuffer {
    getActualCoord(x, y) {
        return {x, y};
    }

    get width() {
        return this._buffer.readUInt32BE(PNG_WIDTH_OFFSET);
    }

    get height() {
        return this._buffer.readUInt32BE(PNG_HEIGHT_OFFSET);
    }
};
