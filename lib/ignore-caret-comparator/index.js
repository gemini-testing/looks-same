'use strict';

/**
 * State transitions:
 *
 * BeforeFailed
 *     |--> InsideProbableCaret
 *                  |--> OutsideProbableCaret
 *                              |--> InsideDetectedCaret   <--|
 *                                            |--> OutsideDetectedCaret
 *                                                         |--> AfterMarkedCaret
 *
 */

const STATES = {
    BeforeFailedState: require('./states/before-failed'),
    InsideProbableCaretState: require('./states/inside-probable-caret'),
    OutsideProbableCaretState: require('./states/outside-probable-caret'),
    InsideDetectedCaretState: require('./states/inside-detected-caret'),
    OutsideDetectedCaretState: require('./states/outside-detected-caret'),
    AfterMarkedCaretState: require('./states/after-marked-caret')
};

module.exports = class IgnoreCaretComparator {

    constructor(baseComparator, pixelRatio) {
        this.pixelRatio = pixelRatio ? Math.floor(pixelRatio) : 1;
        this.failures = [];
        this._baseComparator = baseComparator;

        this.switchState('BeforeFailedState');
    }

    /**
     * Compare pixels for current active comparator state
     * @param {Object} color1
     * @param {Object} color2
     * @param {Number} x coordinate
     * @param {Number} y coordinate
     * @returns {boolean}
     */
    compare(color1, color2, x, y) {
        return this._baseComparator(color1, color2, x, y)
            ? this._state.validateOnEqual({x, y})
            : this._state.validateOnDiff({x, y});
    }

    switchState(stateName) {
        this._state = new STATES[stateName](this);
    }
};
