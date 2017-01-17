'use strict';

const _ = require('lodash');
const State = require('./state');
const areColorsSame = require('../../same-colors');

module.exports = class InitState extends State {
    validate(firstCaretPoint, imgs) {
        const lastCaretPoint = this._getLastCaretPoint(firstCaretPoint, imgs);

        if (!this._looksLikeCaret(firstCaretPoint, lastCaretPoint)) {
            return false;
        }

        this.caretTopLeft = firstCaretPoint;
        this.caretBottomRight = lastCaretPoint;

        this.switchState('CaretDetectedState');

        return true;
    }

    _getLastCaretPoint(firstCaretPoint, imgs) {
        const getLastCaretPoint_ = (currPoint) => {
            const nextPoint = this._getNextCaretPoint(firstCaretPoint, currPoint);

            return this._isPointOutsideImages(nextPoint, imgs) || this._areColorsSame(nextPoint, imgs)
                ? currPoint
                : getLastCaretPoint_(nextPoint);
        };

        return getLastCaretPoint_(firstCaretPoint);
    }

    _isPointOutsideImages(point, imgs) {
        return _.some(imgs, (png) => point.x >= png.width || point.y >= png.height);
    }

    _areColorsSame(point, imgs) {
        const color1 = imgs.png1.getPixel(point.x, point.y);
        const color2 = imgs.png2.getPixel(point.x, point.y);

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
