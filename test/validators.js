'use strict';

const _ = require('lodash');
const {validateImages} = require('../lib/validators');

describe('lib/validators', () => {
    describe('validateImages', () => {
        it('should not throws if called with buffers', () => {
            assert.doesNotThrow(() => validateImages(Buffer.from('one'), Buffer.from('two')));
        });

        describe('should throws if', () => {
            it('required field "source" does not exist', () => {
                assert.throws(() => {
                    return validateImages({}, {});
                }, TypeError, 'Field "source" does not exist');
            });

            it('required field "boundingBox" does not exist', () => {
                assert.throws(() => {
                    return validateImages(
                        {source: 'image-path'},
                        {source: 'image-path'},
                    );
                }, TypeError, 'Field "boundingBox" does not exist');
            });

            ['left', 'top', 'right', 'bottom'].forEach((field) => {
                it(`required field "${field}" does not exist in "boundingBox"`, () => {
                    assert.throws(() => {
                        return validateImages(
                            {source: 'image-path', boundingBox: _.omit({left: 0, top: 0, right: 0, bottom: 0}, field)},
                            {source: 'image-path', boundingBox: _.omit({left: 0, top: 0, right: 0, bottom: 0}, field)}
                        );
                    }, TypeError, `Field "${field}" does not exist`);
                });
            });

            it('"left" coordinate in "boundingBox" field greater than "right"', () => {
                assert.throws(() => {
                    return validateImages(
                        {source: 'image-path', boundingBox: {left: 1, top: 0, right: 0, bottom: 0}},
                        {source: 'image-path', boundingBox: {left: 1, top: 0, right: 0, bottom: 0}}
                    );
                }, TypeError, '"left" coordinate in "boundingBox" field cannot be greater than "right"');
            });

            it('"top" coordinate in "boundingBox" field greater than "bottom"', () => {
                assert.throws(() => {
                    return validateImages(
                        {source: 'image-path', boundingBox: {left: 0, top: 1, right: 0, bottom: 0}},
                        {source: 'image-path', boundingBox: {left: 0, top: 1, right: 0, bottom: 0}}
                    );
                }, TypeError, '"top" coordinate in "boundingBox" field cannot be greater than "bottom"');
            });
        });
    });
});
