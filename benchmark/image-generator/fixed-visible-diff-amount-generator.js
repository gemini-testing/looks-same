const {JND} = require('./constants');
const {HistCieDiffColorsGenerator} = require('./hist-cie-diff-colors-generator');
const {ImageGenerator} = require('./image-generator');

exports.FixedVisibleDiffAmountGenerator = class FixedVisibleDiffAmountGenerator extends ImageGenerator {
    constructor(width, height, diffPercent) {
        const colorsGenerator = new HistCieDiffColorsGenerator([
            [0, Number.MIN_VALUE, 1 - diffPercent],
            [JND, 100, diffPercent]
        ]);
        const colors = new Array(width * height).fill(null).map(() => colorsGenerator.getRandomRgbColor());

        super(width, height, colors);
    }
};
