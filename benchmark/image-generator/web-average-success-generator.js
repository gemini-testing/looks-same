const {HistCieDiffColorsGenerator} = require('./hist-cie-diff-colors-generator');
const {AVERAGE_SUCCESS_HIST_BUCKETS} = require('./constants');
const {ImageGenerator} = require('./image-generator');

const AVERAGE_FAILED_WIDTH = 656;
const AVERAGE_FAILED_HEIGHT = 547;

exports.WebAverageSuccessGenerator = class WebAverageSuccessGenerator extends ImageGenerator {
    constructor(width = AVERAGE_FAILED_WIDTH, height = AVERAGE_FAILED_HEIGHT) {
        const colorsGenerator = new HistCieDiffColorsGenerator(AVERAGE_SUCCESS_HIST_BUCKETS);
        const colors = new Array(width * height).fill(null).map(() => colorsGenerator.getRandomRgbColor());

        super(width, height, colors);
    }
};
