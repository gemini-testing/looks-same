'use strict';

const fs = require('fs-extra');
const NestedError = require('nested-error-stacks');
const OriginalBuffer = require('./original-buffer');
const BoundedBuffer = require('./bounded-buffer');

exports.create = (buffer, {boundingBox} = {}) => {
    return boundingBox
        ? BoundedBuffer.create(buffer, boundingBox)
        : OriginalBuffer.create(buffer);
};

exports.fromFile = async (filePath, opts = {}) => {
    try {
        const buffer = await fs.readFile(filePath);
        return exports.create(buffer, opts);
    } catch (err) {
        throw new NestedError(`Can't load png file ${filePath}`, err);
    }
};
