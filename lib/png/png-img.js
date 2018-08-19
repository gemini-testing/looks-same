'use strict';

const PngBase = require('./png');

module.exports = class PngImgWrapper extends PngBase {
    static create(pngImgInst) {
        return new PngImgWrapper(pngImgInst);
    }

    getPixel(x, y) {
        const {r: R, g: G, b: B} = this._png.get(x, y);
        return {R, G, B};
    }

    setPixel(x, y, color) {
        this._png.set(x, y, color);
    }

    get width() {
        return this._png.size().width;
    }

    get height() {
        return this._png.size().height;
    }

    save(path, callback) {
        this._png.save(path, callback);
    }
}
