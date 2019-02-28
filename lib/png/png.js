'use strict';

const fs = require('fs');
const concat = require('concat-stream');

module.exports = class PNGImage {
    static create(...args) {
        return new this(...args);
    }

    constructor(png) {
        this._png = png;
    }

    getPixel(x, y) {
        const idx = this._getIdx(x, y);
        return {
            R: this._png.data[idx],
            G: this._png.data[idx + 1],
            B: this._png.data[idx + 2]
        };
    }

    setPixel(x, y, color) {
        const idx = this._getIdx(x, y);
        this._png.data[idx] = color.R;
        this._png.data[idx + 1] = color.G;
        this._png.data[idx + 2] = color.B;
        this._png.data[idx + 3] = 255;
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

    _getIdx(x, y) {
        return (this._png.width * y + x) * 4;
    }

    save(path, callback) {
        const writeStream = fs.createWriteStream(path);
        this._png.pack().pipe(writeStream);

        writeStream.on('error', (error) => callback(error));
        writeStream.on('finish', () => callback(null));
    }

    createBuffer(callback) {
        this._png.pack().pipe(concat(gotDiff));
        this._png.on('error', (error) => callback(error, null));

        function gotDiff(data) {
            callback(null, data);
        }
    }
};
