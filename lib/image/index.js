'use strict';

const fs = require('fs-extra');
const NestedError = require('nested-error-stacks');
const sharp = require('sharp');
const OriginalIMG = require('./original-image');
const BoundedIMG = require('./bounded-image');

const createimage = async (img, {boundingBox} = {}) => {
    return boundingBox
        ? BoundedIMG.create(img, boundingBox)
        : OriginalIMG.create(img);
};

exports.fromBuffer = async (buffer, opts) => {
    const img = sharp(buffer, opts);
    return createimage(img, opts);
};

exports.fromFile = async (filePath, opts = {}) => {
    try {
        const buffer = await fs.readFile(filePath);
        return exports.fromBuffer(buffer, opts);
    } catch (err) {
        throw new NestedError(`Can't load img file ${filePath}`, err);
    }
};
