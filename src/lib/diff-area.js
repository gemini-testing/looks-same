'use strict';

module.exports = class DiffArea {
    static create() {
        return new DiffArea();
    }

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

        return this;
    }

    isPointInArea(x, y, radius) {
        const {left, top, right, bottom} = this._diffArea;

        return x >= (left - radius) && x <= (right + radius) && y >= (top - radius) && y <= (bottom + radius);
    }

    isEmpty() {
        return !this._updated;
    }

    get area() {
        return this._diffArea;
    }
};
