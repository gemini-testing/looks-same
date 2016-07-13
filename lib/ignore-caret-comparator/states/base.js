'use strict';

module.exports = class BaseState {
    constructor(comparator) {
        this._ctx = comparator;
    }

    validateOnEqual(point) {
        return true;
    }

    validateOnDiff(point) {
        return false;
    }

    switchState(state) {
        this._ctx.switchState(state);
    }

    get failures() {
        return this._ctx.failures;
    }

    set failures(failures) {
        this._ctx.failures = failures;
    }

    addFailurePoint(point) {
        this.failures.push(point);
    }
};
