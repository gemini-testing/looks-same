'use strict';

/*
 * Anti-aliased pixel detector
 * @see http://www.eejournal.ktu.lt/index.php/elt/article/view/10058/5000
 */

const DEFAULT_BRIGHTNESS_TOLERANCE = 0;

module.exports = class AntialiasingComparator {
    constructor(baseComparator, png1, png2, {antialiasingTolerance = 0}) {
        this._baseComparator = baseComparator;
        this._img1 = png1;
        this._img2 = png2;
        this._brightnessTolerance = antialiasingTolerance; // used only when comparing the darkest and the brightest pixels
    }

    compare(data) {
        return this._baseComparator(data) || this._checkIsAntialiased(data);
    }

    _checkIsAntialiased(data) {
        return this._isAntialiased(this._img2, data.x, data.y, data, this._img1)
            || this._isAntialiased(this._img1, data.x, data.y, data, this._img2);
    }

    _isAntialiased(img1, x1, y1, data, img2) {
        const color1 = img1.getPixel(x1, y1);
        const width = data.width;
        const height = data.height;
        const x0 = Math.max(x1 - 1, 0);
        const y0 = Math.max(y1 - 1, 0);
        const x2 = Math.min(x1 + 1, width - 1);
        const y2 = Math.min(y1 + 1, height - 1);

        const checkExtremePixels = !img2;
        const brightnessTolerance = checkExtremePixels ? this._brightnessTolerance : DEFAULT_BRIGHTNESS_TOLERANCE;

        let zeroes = 0;
        let positives = 0;
        let negatives = 0;
        let min = 0;
        let max = 0;
        let minX, minY, maxX, maxY;

        for (let y = y0; y <= y2; y++) {
            for (let x = x0; x <= x2; x++) {
                if (x === x1 && y === y1) {
                    continue;
                }

                // brightness delta between the center pixel and adjacent one
                const delta = this._brightnessDelta(img1.getPixel(x, y), color1);

                // count the number of equal, darker and brighter adjacent pixels
                if (Math.abs(delta) <= brightnessTolerance) {
                    zeroes++;
                } else if (delta > brightnessTolerance) {
                    positives++;
                } else {
                    negatives++;
                }

                // if found more than 2 equal siblings, it's definitely not anti-aliasing
                if (zeroes > 2) {
                    return false;
                }

                if (checkExtremePixels) {
                    continue;
                }

                // remember the darkest pixel
                if (delta < min) {
                    min = delta;
                    minX = x;
                    minY = y;
                }
                // remember the brightest pixel
                if (delta > max) {
                    max = delta;
                    maxX = x;
                    maxY = y;
                }
            }
        }

        if (checkExtremePixels) {
            return true;
        }

        // if there are no both darker and brighter pixels among siblings, it's not anti-aliasing
        if (negatives === 0 || positives === 0) {
            return false;
        }

        // if either the darkest or the brightest pixel has more than 2 equal siblings in both images
        // (definitely not anti-aliased), this pixel is anti-aliased
        return (!this._isAntialiased(img1, minX, minY, data) && !this._isAntialiased(img2, minX, minY, data)) ||
            (!this._isAntialiased(img1, maxX, maxY, data) && !this._isAntialiased(img2, maxX, maxY, data));
    }

    _brightnessDelta(color1, color2) {
        return rgb2y(color1.R, color1.G, color1.B) - rgb2y(color2.R, color2.G, color2.B);
    }
};

// gamma-corrected luminance of a color (YIQ NTSC transmission color space)
// see https://www.academia.edu/8200524/DIGITAL_IMAGE_PROCESSING_Digital_Image_Processing_PIKS_Inside_Third_Edition
function rgb2y(r, g, b) {
    return r * 0.29889531 + g * 0.58662247 + b * 0.11448223;
}
