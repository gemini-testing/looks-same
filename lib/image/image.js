'use strict';

const ImageBase = require('../image-base');

module.exports = class Image extends ImageBase {
    constructor(img) {
        super();

        this._img = img;
    }

    async init() {
        const {data, info} = await this._img.raw().toBuffer({resolveWithObject: true});

        this._buffer = data;
        this._width = info.width;
        this._height = info.height;
        this._channels = info.channels;
    }

    async initMeta() {
        const {width, height, channels} = await this._img.metadata();

        this._width = width;
        this._height = height;
        this._channels = channels;
    }

    getPixel(x, y) {
        const idx = this._getIdx(x, y);
        return {
            R: this._buffer[idx],
            G: this._buffer[idx + 1],
            B: this._buffer[idx + 2]
        };
    }

    _getIdx(x, y) {
        return (this._width * y + x) * this._channels;
    }

    async save(path) {
        return this._img.toFile(path);
    }

    async createBuffer(extension) {
        return this._img.toFormat(extension).toBuffer();
    }
};
