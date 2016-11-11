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
     * @param {Object} data
     * @param {Object} data.color1
     * @param {Object} data.color2
     * @param {Number} data.x coordinate
     * @param {Number} data.y coordinate
     * @returns {boolean}
     */
    compare(data) {
        return this._baseComparator(data)
            ? this._state.validateOnEqual({x: data.x, y: data.y})
            : this._state.validateOnDiff({x: data.x, y: data.y});
    }

    switchState(stateName) {
        this._state = new STATES[stateName](this);
    }
};
