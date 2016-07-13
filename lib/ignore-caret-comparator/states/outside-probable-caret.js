'use strict';

const OutsideCaretState = require('./outside-caret');

module.exports = class OutsideProbableCaretState extends OutsideCaretState {
    validateOnEqual(point) {
        return !this.isUnderFailedRow(point);
    }
};

