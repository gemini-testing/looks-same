'use strict';

const Image = require('./image');

module.exports = class BoundedImage extends Image {
    constructor(img, boundingBox) {
        super(img);

        this._boundingBox = boundingBox;
    }

    getPixel(x, y) {
        const {x: actX, y: actY} = this.getActualCoord(x, y);

        return super.getPixel(actX, actY);
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
};
