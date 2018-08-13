'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('IgnoreCaretComparator', () => {
    const sandbox = sinon.sandbox.create();

    let IgnoreCaretComparator;
    let areColorsSame;

    const compareImages = (pixels, comparator) => {
        const emptyPixels = _.map(pixels, (pixelRow) => Array(pixelRow.length).fill(0));
        const width = pixels[0].length;
        const height = pixels.length;

        const png1 = {data: pixels, getPixel: (x, y) => pixels[y][x], width, height};
        const png2 = {data: emptyPixels, getPixel: (x, y) => emptyPixels[y][x], width, height};

        let res = true;

        for (let y = 0; y < pixels.length; ++y) {
            for (let x = 0; x < pixels[y].length; ++x) {
                res = comparator({color1: png1.data[y][x], color2: png2.data[y][x], x, y, png1, png2});
                if (!res) {
                    break;
                }
            }
            if (!res) {
                break;
            }
        }

        return res;
    };

    const execComparator = (params, pixels) => {
        const colorComparator = (data) => data.color1 === data.color2;
        const ignoreCaretComparator = new IgnoreCaretComparator(colorComparator, params.pixelRatio);
        return compareImages(pixels, ignoreCaretComparator.compare.bind(ignoreCaretComparator));
    };

    const expectAccepted = (params, pixels) => {
        expect(execComparator(params, pixels)).to.equal(true);
    };

    const expectDeclined = (params, pixels) => {
        expect(execComparator(params, pixels)).to.equal(false);
    };

    beforeEach(() => {
        areColorsSame = sandbox.stub().returns(true);
        areColorsSame
            .withArgs({color1: 1, color2: 0}).returns(false)
            .withArgs({color1: 0, color2: 1}).returns(false)
            .returns(true);
        areColorsSame['@global'] = true;

        IgnoreCaretComparator = proxyquire('../lib/ignore-caret-comparator', {
            '../../same-colors': areColorsSame
        });
    });

    afterEach(() => sandbox.restore());

    it('should accept equal images', () => {
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

    it('should decline images with caret which width is greater than given pixelRatio', () => {
        expectDeclined({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with caret which width is greater than given fractional pixelRatio', () => {
        expectDeclined({pixelRatio: 1.5}, [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with caret which width is less than given pixelRatio', () => {
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

    it('should decline images with multiple carets (more than 1 vertical lines)', () => {
        expectDeclined({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 1, 0, 1],
            [0, 1, 0, 1],
            [0, 0, 0, 0]
        ]);
    });

    it('should decline images with more difference, than caret', () => {
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

    it('should accept images with caret in the bottom right corner', () => {
        expectAccepted({pixelRatio: 1}, [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 0, 1]
        ]);
    });

    it('should decline images with difference on the right border (pixelRatio is 2)', () => {
        expectDeclined({pixelRatio: 2}, [
            [0, 0, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 0]
        ]);
    });
});
