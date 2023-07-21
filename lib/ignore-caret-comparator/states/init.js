'use strict';

const State = require('./state');
const areColorsSame = require('../../same-colors');

module.exports = class InitState extends State {
    validate(data) {
        const lastCaretPoint = this._getLastCaretPoint(data);

        if (!this._looksLikeCaret(data, lastCaretPoint)) {
            return false;
        }

        this.caretTopLeft = data;
        this.caretBottomRight = lastCaretPoint;

        this.switchState('CaretDetectedState');

        return true;
    }

    _getLastCaretPoint(data) {
        let currPoint = data;

        /* eslint-disable-next-line no-constant-condition */
        while (true) {
            const nextPoint = this._getNextCaretPoint(data, currPoint);

            if (this._isPointOutsideImages(nextPoint, data) || this._areColorsSame(nextPoint, data)) {
                return currPoint;
            }
            currPoint = nextPoint;
        }
    }

    _isPointOutsideImages(point, data) {
        return point.x >= data.minWidth || point.y >= data.minHeight;
    }

    _areColorsSame(point, data) {
        const color1 = data.img1.getPixel(point.x, point.y);
        const color2 = data.img2.getPixel(point.x, point.y);

        return areColorsSame({color1, color2});
    }

    _getNextCaretPoint(firstCaretPoint, currPoint) {
        const nextX = currPoint.x + 1;

        return nextX < firstCaretPoint.x + this.pixelRatio
            ? {x: nextX, y: currPoint.y}
            : {x: firstCaretPoint.x, y: currPoint.y + 1};
    }

    _looksLikeCaret(firstCaretPoint, lastCaretPoint) {
        return this._caretHeight(firstCaretPoint, lastCaretPoint) > 1
            && this._caretWidth(firstCaretPoint, lastCaretPoint) === this.pixelRatio;
    }

    _caretHeight(firstCaretPoint, lastCaretPoint) {
        return (lastCaretPoint.y - firstCaretPoint.y) + 1;
    }

    _caretWidth(firstCaretPoint, lastCaretPoint) {
        return (lastCaretPoint.x - firstCaretPoint.x) + 1;
    }
};
