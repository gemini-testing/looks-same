'use strict';

const expect = require('chai').expect;
const DiffArea = require('../lib/diff-area');

describe('DiffArea', () => {
    it('should init diff area with default params', () => {
        const diffArea = new DiffArea();

        expect(diffArea.area).to.deep.equal({left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity});
    });

    it('should update diff area', () => {
        const diffArea = new DiffArea();

        diffArea.update(99, 99);

        expect(diffArea.area).to.deep.equal({left: 99, top: 99, right: 99, bottom: 99});
    });

    describe('isEmpty', () => {
        it('should return "true" if area is empty', () => {
            const diffArea = new DiffArea();

            expect(diffArea.isEmpty()).to.equal(true);
        });

        it('should return "false" if area is not empty', () => {
            const diffArea = new DiffArea();

            diffArea.update(99, 99);

            expect(diffArea.isEmpty()).to.equal(false);
        });
    });
});
