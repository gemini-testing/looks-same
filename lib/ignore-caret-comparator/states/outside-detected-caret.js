'use strict';

const OutsideCaretState = require('./outside-caret');

module.exports = class OutsideDetectedCaretState extends OutsideCaretState {
    validateOnEqual(point) {
        if (this.isUnderFailedRow(point)) {
            this.switchState('AfterMarkedCaretState');
        }

        return true;
    }
};
