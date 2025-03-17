const {labToRgb} = require('./utils');
const {CONSTRAST_REFERENCE_COLOR} = require('./constants');
const {ImageGenerator} = require('./image-generator');

exports.ContrastToReferenceGenerator = class ContrastToReferenceGenerator extends ImageGenerator {
    constructor(width, height) {
        const colors = new Array(width * height).fill(labToRgb(CONSTRAST_REFERENCE_COLOR));

        super(width, height, colors);
    }
};
