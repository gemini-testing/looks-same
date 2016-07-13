'use strict';

const InsideCaretState = require('./inside-caret');

module.exports = class InsideProbableCaretState extends InsideCaretState {
    validateOnEqual(point) {
        if (!super.validateOnEqual(point)) {
            return false;
        }

        this.switchState('OutsideProbableCaretState');
        return true;
    }
};
