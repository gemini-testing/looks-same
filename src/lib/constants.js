'use strict';

module.exports = {
    JND: 2.3, // Just noticeable difference if ciede2000 >= JND then colors difference is noticeable by human eye
    REQUIRED_IMAGE_FIELDS: ['source', 'boundingBox'],
    REQUIRED_BOUNDING_BOX_FIELDS: ['left', 'top', 'right', 'bottom'],
    CLUSTERS_SIZE: 10
};
