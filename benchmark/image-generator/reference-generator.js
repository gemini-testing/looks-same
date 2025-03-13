const {labToRgb} = require('./utils');
const {REFERENCE_COLOR} = require('./constants');
const {ImageGenerator} = require('./image-generator');

exports.ReferenceGenerator = class ReferenceGenerator extends ImageGenerator {
    constructor(width, height) {
        const colors = new Array(width * height).fill(labToRgb(REFERENCE_COLOR));

        super(width, height, colors);
    }
};
