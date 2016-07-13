'use strict';

const BaseState = require('./base');

module.exports = class InsideCaretState extends BaseState {
    validateOnEqual(point) {
        return this.failures.length >= this._ctx.pixelRatio
    }

    validateOnDiff(point) {
        if (this.failures.length === this._ctx.pixelRatio) {
            return false;
        }

        this.addFailurePoint(point);
        return true;
    }
};

