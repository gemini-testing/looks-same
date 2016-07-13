'use strict';

const BaseState = require('./base');

module.exports = class OutsideCaretState extends BaseState {
    validateOnDiff(point) {
        if (!this.isUnderFailedRow(point)) {
            return false;
        }

        this.failures = [point];
        this.switchState('InsideDetectedCaretState');
        return true;
    }

    isUnderFailedRow(point) {
        const failure = this.failures[0];
        return point.x === failure.x && point.y === failure.y + 1;
    }
};
