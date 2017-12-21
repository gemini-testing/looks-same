'use strict';
const png = require('../lib/png');

const readPair = (first, second, callback) => {
    const src = {first, second};
    const result = {first: null, second: null};

    let read = 0;
    let failed = false;

    ['first', 'second'].forEach((key) => {
        const source = src[key];
        const readFunc = Buffer.isBuffer(source) ? png.fromBuffer : png.fromFile;

        readFunc(source, (error, png) => {
            if (failed) {
                return;
            }

            if (error) {
                failed = true;
                return callback(error, null);
            }

            result[key] = png;
            read++;

            if (read === 2) {
                callback(null, result);
            }
        });
    });
};

const getDiffPixelsCoords = (png1, png2, predicate, stopOnFirstFail=true) => {
    const width = Math.min(png1.width, png2.width);
    const height = Math.min(png1.height, png2.height);

    const diffPixelsCoords = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color1 = png1.getPixel(x, y);
            const color2 = png2.getPixel(x, y);

            const result = predicate({
                color1, color2,
                png1, png2,
                x, y,
                width, height
            });

            if (!result) {
                diffPixelsCoords.push([x, y]);

                if (stopOnFirstFail) {
                    return diffPixelsCoords;
                }
            }
        }
    }

    return diffPixelsCoords;
};

module.exports = {
    readPair,
    getDiffPixelsCoords
};
