'use strict';

module.exports = class DiffArea {
    constructor() {
        this._diffArea = {left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity};
        this._updated = false;
    }

    update(x, y) {
        const {left, top, right, bottom} = this._diffArea;

        this._diffArea = {
            left: Math.min(left, x),
            top: Math.min(top, y),
            right: Math.max(right, x),
            bottom: Math.max(bottom, y)
        };
        this._updated = true;
    }

    isEmpty() {
        return !this._updated;
    }

    get area() {
        return this._diffArea;
    }
};
