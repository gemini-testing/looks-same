'use strict';

const BaseState = require('./base');

module.exports = class BeforeFailedState extends BaseState {
    validateOnDiff(point) {
        this.addFailurePoint(point);
        this.switchState('InsideProbableCaretState');
        return true;
    }
};
