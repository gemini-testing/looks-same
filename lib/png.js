'use strict';
const fs = require('fs');
const PNG = require('pngjs').PNG;
const concat = require('concat-stream');

/**
 * @class PNGImage
 */
class PNGImage {
    /**
     * @param {Object} png
     * @constructor
     */
    constructor(png) {
        this._png = png;
    }

    /**
     * Returns color of pixel with given coordinates
     * @param {Number} x coordinate
     * @param {Number} y coordinate
     * @returns {{R: (*|Object), G: (*|Object), B: (*|Object)}}
     */
    getPixel(x, y) {
        const idx = this._getIdx(x, y);
        return {
            R: this._png.data[idx],
            G: this._png.data[idx + 1],
            B: this._png.data[idx + 2],
            A: this._png.data[idx + 3]
        };
    }

    /**
     * Sets color data to pixel with given coordinates
     * @param {Number} x coordinate
     * @param {Number} y coordinate
     * @param {Object} color RGB formatted color {R:0-255, G:0-255, B:0-255}
     * @param {Number} [alpha=255] A level to set for the alpha channel, 0-255
     */
    setPixel(x, y, color, alpha) {
        const idx = this._getIdx(x, y);
        this._png.data[idx] = color.R;
        this._png.data[idx + 1] = color.G;
        this._png.data[idx + 2] = color.B;
        this._png.data[idx + 3] = isNaN(alpha) ? 255 : alpha;
    }

    /**
     * Returns image width
     * @returns {Number}
     */
    get width() {
        return this._png.width;
    }

    /**
     * Returns image height
     * @returns {Number}
     */
    get height() {
        return this._png.height;
    }

    /**
     * Returns index of pixel for given coordinates
     * @param {Number} x coordinate
     * @param {Number} y coordinate
     * @returns {Number}
     * @private
     */
    _getIdx(x, y) {
        return (this._png.width * y + x) * 4;
    }

    /**
     * Saves image to file for given path
     * @param {String} path
     * @param {function} callback function
     */
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
}

/**
 * Returns png image file loaded from given file path
 * @param {String} filePath - image file path
 * @param {function} callback function
 */
exports.fromFile = (filePath, callback) => {
    fs.readFile(filePath, (error, data) => {
        error
            ? callback(error, null)
            : exports.fromBuffer(data, callback);
    });
};

/**
 * Returns png image loaded from buffer
 * @param {Buffer} buffer - image buffer
 * @param {function} callback function
 */
exports.fromBuffer = (buffer, callback) => {
    const png = new PNG();
    png.parse(buffer, (error) => {
        error
            ? callback(error, null)
            : callback(null, new PNGImage(png));
    });
};

/**
 * Returns new empty png image of given size
 * @param {Number} width - image width
 * @param {Number} height - image height
 */
exports.empty = (width, height) => new PNGImage(new PNG({width, height}));
