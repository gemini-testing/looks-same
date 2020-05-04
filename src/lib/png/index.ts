import fs from 'fs-extra';
import NestedError from 'nested-error-stacks';
import {PNG} from 'pngjs';
import OriginalPNG from './original-png';
import BoundedPNG from './bounded-png';

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

export const create = (png, {boundingBox = undefined} = {}) => {
    return boundingBox
        ? BoundedPNG.create(png, boundingBox)
        : OriginalPNG.create(png);
};

export const fromFile = async (filePath, opts = {}) => {
    try {
        const buffer = await fs.readFile(filePath);
        return await exports.fromBuffer(buffer, opts);
    } catch (err) {
        throw new NestedError(`Can't load png file ${filePath}`, err);
    }
};

export const fromBuffer = async (buffer, opts = {}) => {
    const png = await parseBuffer(buffer);
    return exports.create(png, opts);
};

export const empty = (width, height) => exports.create(new PNG({width, height}));
