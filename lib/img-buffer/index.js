'use strict';

const fs = require('fs');
const NestedError = require('nested-error-stacks');
const OriginalBuffer = require('./original-buffer');
const BoundedBuffer = require('./bounded-buffer');

exports.create = (buffer, {boundingBox} = {}) => {
    if (buffer.length === 0) {
        throw new Error('File is empty and cannot be processed as an image');
    }

    return boundingBox
        ? BoundedBuffer.create(buffer, boundingBox)
        : OriginalBuffer.create(buffer);
};

exports.fromFile = async (filePath, opts = {}) => {
    try {
        const buffer = await fs.promises.readFile(filePath);
        return exports.create(buffer, opts);
    } catch (err) {
        throw new NestedError(`Can't load img file ${filePath}`, err);
    }
};
