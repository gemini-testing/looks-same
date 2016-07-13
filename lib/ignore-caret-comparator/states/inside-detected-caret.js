'use strict';

const InsideCaretState = require('./inside-caret');

module.exports = class InsideDetectedCaretState extends InsideCaretState {
    validateOnEqual(point) {
        if (!super.validateOnEqual(point)) {
            return false;
        }

        this.switchState('OutsideDetectedCaretState');
        return true;
    }
};

