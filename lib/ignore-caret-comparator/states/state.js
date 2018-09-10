'use strict';

module.exports = class State {
    constructor(comparator) {
        this._ctx = comparator;
    }

    validate() {
        throw new Error('Not implemented');
    }

    switchState(state) {
        this._ctx.switchState(state);
    }

    get pixelRatio() {
        return this._ctx.pixelRatio;
    }

    get caretTopLeft() {
        return this._ctx.caretTopLeft;
    }

    set caretTopLeft(point) {
        this._ctx.caretTopLeft = point;
    }

    get caretBottomRight() {
        return this._ctx.caretBottomRight;
    }

    set caretBottomRight(point) {
        this._ctx.caretBottomRight = point;
    }
};
