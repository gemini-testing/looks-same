'use strict';

const IMGBuffer = require('./buffer');

module.exports = class BoundedIMGBuffer extends IMGBuffer {
    constructor(buffer, boundingBox) {
        super(buffer);

        this._boundingBox = boundingBox;
    }

    getActualCoord(x, y) {
        return {x: x + this._boundingBox.left, y: y + this._boundingBox.top};
    }

    get width() {
        return this._boundingBox.right - this._boundingBox.left + 1;
    }

    get height() {
        return this._boundingBox.bottom - this._boundingBox.top + 1;
    }

    get boundingBox() {
        return this._boundingBox;
    }
};
