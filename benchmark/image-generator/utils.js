const colorConvert = require('color-convert');

exports.labToRgb = function labToRgb(labColors) {
    return colorConvert.lab.rgb(labColors);
};
