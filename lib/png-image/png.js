'use strict';

const fs = require('fs');
const concat = require('concat-stream');
const PNGBase = require('../png-base');

module.exports = class PNGImage extends PNGBase {
    constructor(png) {
        super();

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

    _getIdx(x, y) {
        return (this._png.width * y + x) * 4;
    }

    async save(path) {
        const writeStream = fs.createWriteStream(path);
        this._png.pack().pipe(writeStream);

        return new Promise((resolve, reject) => {
            writeStream.on('error', (error) => reject(error));
            writeStream.on('finish', () => resolve(null));
        });
    }

    async createBuffer() {
        return new Promise((resolve, reject) => {
            this._png.pack().pipe(concat(resolve));
            this._png.on('error', reject);
        });
    }
};
