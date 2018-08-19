'use strict';

const fs = require('fs');
const {PNG: PngJs} = require('pngjs');
const concat = require('concat-stream');
const PngBase = require('./png');

module.exports = class PngJsWrapper extends PngBase {
    static create(pngJsInst) {
        return new PngJsWrapper(pngJsInst);
    }

    static fromFile(filePath, cb) {
        fs.readFile(filePath, (error, data) => {
            error
                ? cb(error, null)
                : PngJsWrapper.fromBuffer(data, cb);
        });
    }

    static fromBuffer(buffer, cb) {
        const pngJsInst = new PngJs();

        pngJsInst.parse(buffer, (error) => {
            error
                ? cb(error, null)
                : cb(null, new PngJsWrapper(pngJsInst));
        });
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

    get width() {
        return this._png.width;
    }

    get height() {
        return this._png.height;
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
