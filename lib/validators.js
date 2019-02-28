'use strict';

const _ = require('lodash');
const {REQUIRED_IMAGE_FIELDS, REQUIRED_BOUNDING_BOX_FIELDS} = require('./constants');

const validateRequiredFields = (value, fields) => {
    [].concat(fields).forEach((field) => {
        if (!_.hasIn(value, field)) {
            throw new TypeError(`Field "${field}" does not exist in ${JSON.stringify(value)}`);
        }
    });
};

const validateBoundingBoxCoords = ({boundingBox}) => {
    if (boundingBox.left > boundingBox.right) {
        throw new TypeError('"left" coordinate in "boundingBox" field cannot be greater than "right"');
    }

    if (boundingBox.top > boundingBox.bottom) {
        throw new TypeError('"top" coordinate in "boundingBox" field cannot be greater than "bottom"');
    }
};

exports.validateImages = (img1, img2) => {
    [img1, img2].forEach((i) => {
        if (Buffer.isBuffer(i) || !_.isObject(i)) {
            return;
        }

        validateRequiredFields(i, REQUIRED_IMAGE_FIELDS);
        validateRequiredFields(i.boundingBox, REQUIRED_BOUNDING_BOX_FIELDS);
        validateBoundingBoxCoords(i);
    });
};
