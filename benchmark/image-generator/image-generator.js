const assert = require('node:assert');
const sharp = require('sharp');
const {CHANNELS_COUNT} = require('./constants');

exports.ImageGenerator = class ImageGenerator {
    constructor(width, height, rgbColors) {
        assert(
            width * height === rgbColors.length,
            `rgbColors array length missmatch.\nArray length: ${rgbColors.length}, w: ${width}, h: ${height}`
        );

        const rawInput = new Uint8Array(width * height * CHANNELS_COUNT);

        let rawInputPosition = 0;

        for (const rgbColor of rgbColors) {
            for (const byte of rgbColor) {
                rawInput[rawInputPosition++] = byte;
            }
        }

        this._width = width;
        this._height = height;
        this._sharpImage = sharp(rawInput, {
            raw: {
                width,
                height,
                channels: CHANNELS_COUNT
            }
        });
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    toPngBuffer() {
        return this._sharpImage.png().toBuffer({resolveWithObject: false});
    }
};
