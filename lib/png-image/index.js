'use strict';

const fs = require('fs-extra');
const NestedError = require('nested-error-stacks');
const {PNG} = require('pngjs');
const OriginalPNG = require('./original-png');
const BoundedPNG = require('./bounded-png');

function parseBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const png = new PNG();
        png.parse(buffer, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(png);
            }
        });
    });
}

exports.create = (png, {boundingBox} = {}) => {
    return boundingBox
        ? BoundedPNG.create(png, boundingBox)
        : OriginalPNG.create(png);
};

exports.fromFile = async (filePath, opts = {}) => {
    try {
        const buffer = await fs.readFile(filePath);
        return await exports.fromBuffer(buffer, opts);
    } catch (err) {
        throw new NestedError(`Can't load png file ${filePath}`, err);
    }
};

exports.fromBuffer = async (buffer, opts = {}) => {
    const png = await parseBuffer(buffer);
    return exports.create(png, opts);
};

exports.empty = (width, height) => exports.create(new PNG({width, height}));
