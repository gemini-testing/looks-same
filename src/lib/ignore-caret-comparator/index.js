'use strict';

const _ = require('lodash');

const STATES = {
    InitState: require('./states/init'),
    CaretDetectedState: require('./states/caret-detected')
};

module.exports = class IgnoreCaretComparator {
    constructor(baseComparator, pixelRatio) {
        this.pixelRatio = pixelRatio ? Math.floor(pixelRatio) : 1;
        this.caretTopLeft = null;
        this.caretBottomRight = null;
        this._baseComparator = baseComparator;

        this.switchState('InitState');
    }

    /**
     * Compare pixels for current active comparator state
     * @param {Object} data
     * @param {Object} data.color1
     * @param {Object} data.color2
     * @param {Number} data.x coordinate
     * @param {Number} data.y coordinate
     * @returns {boolean}
     */
    compare(data) {
        return this._baseComparator(data) || this._checkIsCaret(data);
    }

    _checkIsCaret(data) {
        return this._state.validate(_.pick(data, ['x', 'y']), _.pick(data, ['png1', 'png2']));
    }

    switchState(stateName) {
        this._state = new STATES[stateName](this);
    }
};
