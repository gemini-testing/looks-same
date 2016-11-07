'use strict';

const expect = require('chai').expect;
const IgnoreCaretComparator = require('../lib/ignore-caret-comparator');

describe('IgnoreCaretComparator', () => {
    it('should accept valid image', () => {
        expectAccepted({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with 1px diff', () => {
        expectDeclined({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should accept images with caret which width is equal to given pixelRatio', () => {
        expectAccepted({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with caret which width is greater then given pixelRatio', () => {
        expectDeclined({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with caret which width is greater then given fractional pixelRatio', () => {
        expectDeclined({pixelRatio: 1.5}, [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with caret which width is less then given pixelRatio', () => {
        expectDeclined({pixelRatio: 2}, [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with 1px height diff', () => {
        expectDeclined({pixelRatio: 2}, [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images which variable caret width (pixelRatio is 2)', () => {
        expectDeclined({pixelRatio: 2}, [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images which variable caret width (pixelRatio is 1)', () => {
        expectDeclined({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with multiple carets (more then 1 vertical lines)', () => {
        expectDeclined({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 1, 0, 1],
            [0, 1, 0, 1],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with more difference, then caret', () => {
        expectDeclined({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 1, 0, 1],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with broken carets (hole inside caret)', () => {
        expectDeclined({pixelRatio: 1}, [
            [0, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ]);
    });
});

function expectAccepted(params, pixels) {
    expect(execComparator(params, pixels)).to.equal(true);
}

function expectDeclined(params, pixels) {
    expect(execComparator(params, pixels)).to.equal(false);
}

function execComparator(params, pixels) {
    const colorComparator = (data) => !data.color1;
    const ignoreCaretComparator = new IgnoreCaretComparator(colorComparator, params.pixelRatio);
    return comparePixels(pixels, ignoreCaretComparator.compare.bind(ignoreCaretComparator));
}

function comparePixels(pixels, comparator) {
    let res = true;
    for(let y=0; y<pixels.length; ++y) {
        for(let x=0; x<pixels[y].length; ++x) {
            res = comparator({color1: pixels[y][x], x, y});
            if(!res) {
                break;
            }
        }
        if(!res) {
            break;
        }
    }
    return res;
}
