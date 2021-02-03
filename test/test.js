'use strict';

const path = require('path');
const fs = require('fs');
const temp = require('temp');
const expect = require('chai').expect;

const looksSame = require('..');
const utils = require('../lib/utils');
const {readPair, formatImages, getDiffPixelsCoords} = utils;
const areColorsSame = require('../lib/same-colors');

const imagePath = (name) => path.join(__dirname, 'data', name);

const srcPath = (name) => path.join(imagePath(path.join('src', name)));

const readImage = (name) => fs.readFileSync(srcPath(name));

const forFilesAndBuffers = (callback) => {
    describe('with files as arguments', () => {
        callback(srcPath);
    });

    describe('with buffers as arguments', () => {
        callback(readImage);
    });
};

describe('looksSame', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('should throw if both tolerance and strict options set', async () => {
        await assert.isRejected(looksSame(srcPath('ref.png'), srcPath('same.png'), {
            strict: true,
            tolerance: 9000
        }, () => { }), TypeError);
    });

    it('should work when opts is undefined', () => {
        expect(() => {
            looksSame(srcPath('ref.png'), srcPath('same.png'), undefined, () => {});
        }).not.to.throw(TypeError);
    });

    it('should format images', (done) => {
        sinon.spy(utils, 'formatImages');

        looksSame(srcPath('ref.png'), srcPath('same.png'), () => {
            assert.calledOnceWith(utils.formatImages, srcPath('ref.png'), srcPath('same.png'));
            done();
        });
    });

    it('should read formatted images', (done) => {
        const [formattedImg1, formattedImg2] = [{source: srcPath('ref.png')}, {source: srcPath('same.png')}];
        sinon.stub(utils, 'formatImages').returns([formattedImg1, formattedImg2]);
        sinon.spy(utils, 'readPair');

        looksSame(srcPath('ref.png'), srcPath('same.png'), () => {
            assert.calledOnceWith(utils.readPair, formattedImg1, formattedImg2);
            done();
        });
    });

    forFilesAndBuffers((getImage) => {
        it('should return true for similar images (compare only by buffers)', (done) => {
            sinon.stub(utils, 'getDiffPixelsCoords');

            looksSame(getImage('ref.png'), getImage('same.png'), (error, {equal}) => {
                assert.isNull(error);
                assert.isTrue(equal);
                assert.notCalled(utils.getDiffPixelsCoords);
                done();
            });
        });

        it('should return false for different images (compare by png pixels)', (done) => {
            sinon.spy(utils, 'getDiffPixelsCoords');

            looksSame(getImage('ref.png'), getImage('different.png'), (error, {equal}) => {
                assert.isNull(error);
                assert.isFalse(equal);
                assert.calledOnce(utils.getDiffPixelsCoords);
                done();
            });
        });

        it('should return reference image for different images', (done) => {
            looksSame(getImage('ref.png'), getImage('different.png'), (error, {metaInfo: {refImg}}) => {
                expect(refImg).to.deep.equal({size: {width: 50, height: 50}});
                done();
            });
        });

        it('should return reference image for equal images', (done) => {
            looksSame(getImage('ref.png'), getImage('ref.png'), (error, {metaInfo: {refImg}}) => {
                expect(refImg).to.deep.equal({size: {width: 50, height: 50}});
                done();
            });
        });

        it('should return diff bounds for different images', (done) => {
            looksSame(getImage('ref.png'), getImage('different.png'), (error, {diffBounds}) => {
                expect(diffBounds).to.deep.equal({left: 0, top: 10, right: 49, bottom: 39});
                done();
            });
        });

        it('should return true for different images when tolerance is higher than difference', (done) => {
            looksSame(getImage('ref.png'), getImage('different.png'), {tolerance: 50}, (error, {equal}) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(true);
                done();
            });
        });

        it('should return true for different images when difference is not seen by human eye', (done) => {
            looksSame(getImage('ref.png'), getImage('different-unnoticable.png'), (error, {equal}) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(true);
                done();
            });
        });

        it('should return false if difference is not seen by human eye and strict mode is enabled', (done) => {
            looksSame(getImage('ref.png'), getImage('different-unnoticable.png'), {strict: true}, (error, {equal}) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should work when images width does not match', (done) => {
            looksSame(getImage('ref.png'), getImage('wide.png'), (error, {equal}) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should work when images height does not match', (done) => {
            looksSame(getImage('ref.png'), getImage('tall.png'), (error, {equal}) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should return diff bound equal to a bigger image if images have different sizes', (done) => {
            looksSame(srcPath('ref.png'), srcPath('large-different.png'), (error, {equal, diffBounds}) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                expect(diffBounds).to.deep.equal({left: 0, top: 0, right: 499, bottom: 499});
                done();
            });
        });

        it('should return single diff cluster equal to a bigger image if images have different sizes', (done) => {
            looksSame(srcPath('ref.png'), srcPath('large-different.png'), (error, {equal, diffClusters}) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                expect(diffClusters).to.deep.equal([{left: 0, top: 0, right: 499, bottom: 499}]);
                done();
            });
        });

        [
            'red',
            'blue',
            'green'
        ].forEach((channel) => {
            it(`should report image as different if the difference is only in ${channel} channel`, (done) => {
                looksSame(getImage('ref.png'), getImage(`${channel}.png`), (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });
        });

        it('should return false for images which differ from each other only by 1 pixel', (done) => {
            looksSame(getImage('no-caret.png'), getImage('1px-diff.png'), (error, {equal}) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });
    });

    describe('with comparing by areas', () => {
        forFilesAndBuffers((getImage) => {
            describe('if passed areas have different sizes', () => {
                it('should return "false"', (done) => {
                    looksSame(
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 2, bottom: 1}},
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 5, top: 5, right: 5, bottom: 6}},
                        (error, {equal}) => {
                            assert.isNull(error);
                            assert.isFalse(equal);
                            done();
                        }
                    );
                });

                it('should return diff bound for first image equal to a bigger area', (done) => {
                    looksSame(
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 2, bottom: 1}},
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 5, top: 5, right: 5, bottom: 6}},
                        (error, {diffBounds}) => {
                            assert.isNull(error);
                            assert.deepEqual(diffBounds, {left: 1, top: 1, right: 2, bottom: 2});
                            done();
                        }
                    );
                });
            });

            describe('if passed areas have the same sizes but located in various places', () => {
                it('should return true if images are equal', (done) => {
                    looksSame(
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 4, bottom: 4}},
                        {source: getImage('bounding-box-diff-2.png'), boundingBox: {left: 5, top: 5, right: 8, bottom: 8}},
                        (error, {equal}) => {
                            assert.isNull(error);
                            assert.isTrue(equal);
                            done();
                        }
                    );
                });

                it('should return false if images are different', (done) => {
                    looksSame(
                        {source: getImage('bounding-box-ref-1.png'), boundingBox: {left: 1, top: 1, right: 4, bottom: 4}},
                        {source: getImage('bounding-box-ref-2.png'), boundingBox: {left: 5, top: 5, right: 8, bottom: 8}},
                        (error, {equal}) => {
                            assert.isNull(error);
                            assert.isFalse(equal);
                            done();
                        }
                    );
                });

                it('should return diff bound for first image if images are different', (done) => {
                    looksSame(
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 2, bottom: 1}},
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 5, top: 5, right: 5, bottom: 6}},
                        (error, {diffBounds}) => {
                            assert.isNull(error);
                            assert.deepEqual(diffBounds, {left: 1, top: 1, right: 2, bottom: 2});
                            done();
                        }
                    );
                });
            });
        });
    });

    describe('with ignoreCaret', () => {
        forFilesAndBuffers((getImage) => {
            it('should ignore caret by default', (done) => {
                looksSame(getImage('no-caret.png'), getImage('caret.png'), (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('if disabled, should return false for images with caret', (done) => {
                looksSame(getImage('no-caret.png'), getImage('caret.png'), {ignoreCaret: false}, (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });

            it('if enabled, should return true for images with caret', (done) => {
                looksSame(getImage('no-caret.png'), getImage('caret.png'), {ignoreCaret: true}, (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('if enabled, should return true for images with caret intersecting with a letter', (done) => {
                looksSame(getImage('no-caret+text.png'), getImage('caret+text.png'), {ignoreCaret: true}, (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('if enabled, should return true for images with caret and antialiased pixels', (done) => {
                const opts = {
                    ignoreCaret: true,
                    ignoreAntialiasing: true
                };
                looksSame(getImage('caret+antialiasing.png'), getImage('no-caret+antialiasing.png'), opts, (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('if enabled, should return false for images with 1px diff', (done) => {
                looksSame(getImage('no-caret.png'), getImage('1px-diff.png'), (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });
        });
    });

    describe('with antialiasing', () => {
        forFilesAndBuffers((getImage) => {
            it('should check images for antialiasing by default', (done) => {
                looksSame(getImage('antialiasing-ref.png'), getImage('antialiasing-actual.png'), (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('if disabled, should return false for images with antialiasing', (done) => {
                looksSame(getImage('antialiasing-ref.png'), getImage('antialiasing-actual.png'), {ignoreAntialiasing: false}, (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });

            it('if enabled, should return true for images with antialiasing', (done) => {
                looksSame(getImage('antialiasing-ref.png'), getImage('antialiasing-actual.png'), {ignoreAntialiasing: true}, (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('should return false for images which differ even with ignore antialiasing option', (done) => {
                looksSame(getImage('no-caret.png'), getImage('1px-diff.png'), {ignoreAntialiasing: true}, (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });

            [1, 2].forEach((ind) => {
                it('should return false for images with default "antialiasingTolerance"', (done) => {
                    looksSame(
                        getImage(`antialiasing-tolerance-ref-${ind}.png`),
                        getImage(`antialiasing-tolerance-actual-${ind}.png`),
                        {ignoreAntialiasing: true, ignoreCaret: false},
                        (error, {equal}) => {
                            expect(error).to.equal(null);
                            expect(equal).to.equal(false);
                            done();
                        }
                    );
                });

                it('should return true for images with passed "antialiasingTolerance"', (done) => {
                    looksSame(
                        getImage(`antialiasing-tolerance-ref-${ind}.png`),
                        getImage(`antialiasing-tolerance-actual-${ind}.png`),
                        {antialiasingTolerance: 4},
                        (error, {equal}) => {
                            expect(error).to.equal(null);
                            expect(equal).to.equal(true);
                            done();
                        }
                    );
                });
            });
        });
    });
});

describe('createDiff', () => {
    beforeEach(() => {
        this.tempName = temp.path({suffix: '.png'});
    });

    afterEach(() => {
        if (fs.existsSync(this.tempName)) {
            fs.unlinkSync(this.tempName);
        }

        sinon.restore();
    });

    it('should throw if both tolerance and strict options set', () => {
        expect(() => {
            looksSame.createDiff({
                reference: srcPath('ref.png'),
                current: srcPath('different.png'),
                diff: this.tempName,
                highlightColor: '#ff00ff',
                tolerance: 9000,
                strict: true
            }, () => {});
        }).to.throw(TypeError);
    });

    it('should format images', (done) => {
        sinon.spy(utils, 'formatImages');

        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('same.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        }, () => {
            assert.calledOnceWith(utils.formatImages, srcPath('ref.png'), srcPath('same.png'));
            done();
        });
    });

    it('should read formatted images', (done) => {
        const [formattedImg1, formattedImg2] = [{source: srcPath('ref.png')}, {source: srcPath('same.png')}];
        sinon.stub(utils, 'formatImages').returns([formattedImg1, formattedImg2]);
        sinon.spy(utils, 'readPair');

        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('same.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        }, () => {
            assert.calledOnceWith(utils.readPair, formattedImg1, formattedImg2);
            done();
        });
    });

    it('should copy a reference image if there is no difference', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('same.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        }, () => {
            looksSame(srcPath('ref.png'), _this.tempName, {strict: true}, (error, {equal}) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should create an image file with diff between two images', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        }, () => {
            expect(fs.existsSync(_this.tempName)).to.equal(true);
            done();
        });
    });

    it('should ignore the differences lower then tolerance', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff',
            tolerance: 50
        }, () => {
            looksSame(srcPath('ref.png'), _this.tempName, {strict: true}, (error, {equal}) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should create a proper diff', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        }, () => {
            looksSame(imagePath('diffs/small-magenta.png'), _this.tempName, (error, {equal}) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should allow to change highlight color', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#00FF00'
        }, () => {
            looksSame(imagePath('diffs/small-green.png'), _this.tempName, (error, {equal}) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should provide a default highlight color', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName
        }, () => {
            looksSame(imagePath('diffs/small-magenta.png'), _this.tempName, (error, {equal}) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should allow to build diff for taller images', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('tall-different.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF'
        }, () => {
            looksSame(imagePath('diffs/taller-magenta.png'), _this.tempName, (error, {equal}) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should allow to build diff for wider images', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('wide-different.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF'
        }, () => {
            looksSame(imagePath('diffs/wider-magenta.png'), _this.tempName, (error, {equal}) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should use non-strict comparator by default', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different-unnoticable.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF'
        }, () => {
            looksSame(srcPath('ref.png'), _this.tempName, (error, {equal}) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should use strict comparator if strict option is true', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different-unnoticable.png'),
            diff: this.tempName,
            strict: true,
            highlightColor: '#FF00FF'
        }, () => {
            looksSame(imagePath('diffs/strict.png'), _this.tempName, (error, {equal}) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should return a buffer if no diff path option is specified', (done) => {
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            highlightColor: '#ff00ff'
        }, (error, buffer) => {
            expect(buffer).to.be.an.instanceof(Buffer);
            done();
        });
    });

    it('should return a buffer equal to the diff on disk', (done) => {
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            highlightColor: '#ff00ff'
        }, (error, buffer) => {
            looksSame(imagePath('diffs/small-magenta.png'), buffer, (error, {equal}) => {
                expect(equal).to.be.equal(true);
                done();
            });
        });
    });

    describe('with comparing by areas', () => {
        it('should create diff image equal to reference', (done) => {
            looksSame.createDiff({
                reference: {source: srcPath('bounding-box-ref-1.png'), boundingBox: {left: 1, top: 1, right: 4, bottom: 4}},
                current: {source: srcPath('bounding-box-ref-2.png'), boundingBox: {left: 5, top: 5, right: 8, bottom: 8}},
                diff: this.tempName,
                highlightColor: '#FF00FF'
            }, () => {
                looksSame(
                    {source: srcPath('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 4, bottom: 4}},
                    this.tempName,
                    (error, {equal}) => {
                        assert.isNull(error);
                        assert.isTrue(equal, true);
                        done();
                    }
                );
            });
        });
    });

    describe('with antialiasing', () => {
        describe('if there is only diff in antialiased pixels', () => {
            it('should create diff image equal to reference if ignore antialiasing is not set', (done) => {
                looksSame.createDiff({
                    reference: srcPath('antialiasing-ref.png'),
                    current: srcPath('antialiasing-actual.png'),
                    diff: this.tempName,
                    highlightColor: '#FF00FF'
                }, () => {
                    looksSame(
                        srcPath('antialiasing-ref.png'), this.tempName, {ignoreAntialiasing: false},
                        (error, {equal}) => {
                            expect(error).to.equal(null);
                            expect(equal).to.equal(true);
                            done();
                        }
                    );
                });
            });

            it('should create diff image not equal to reference if ignore antialiasing is disabled', (done) => {
                looksSame.createDiff({
                    reference: srcPath('antialiasing-ref.png'),
                    current: srcPath('antialiasing-actual.png'),
                    diff: this.tempName,
                    highlightColor: '#FF00FF',
                    ignoreAntialiasing: false
                }, () => {
                    looksSame(
                        srcPath('antialiasing-ref.png'), this.tempName, {ignoreAntialiasing: false},
                        (error, {equal}) => {
                            expect(error).to.equal(null);
                            expect(equal).to.equal(false);
                            done();
                        }
                    );
                });
            });
        });

        it('should create diff image not equal to reference if there is diff not in antialised pixels', (done) => {
            looksSame.createDiff({
                reference: srcPath('no-caret.png'),
                current: srcPath('1px-diff.png'),
                diff: this.tempName,
                highlightColor: '#FF00FF'
            }, () => {
                looksSame(
                    srcPath('antialiasing-ref.png'), this.tempName,
                    (error, {equal}) => {
                        expect(error).to.equal(null);
                        expect(equal).to.equal(false);
                        done();
                    }
                );
            });
        });
    });

    describe('with ignoreCaret', () => {
        describe('if there is only diff in caret', () => {
            it('should create diff image equal to reference if ignore caret is not set', (done) => {
                looksSame.createDiff({
                    reference: srcPath('no-caret.png'),
                    current: srcPath('caret.png'),
                    diff: this.tempName,
                    highlightColor: '#FF00FF'
                }, () => {
                    looksSame(
                        srcPath('no-caret.png'), this.tempName, {ignoreCaret: false},
                        (error, {equal}) => {
                            expect(error).to.equal(null);
                            expect(equal).to.equal(true);
                            done();
                        }
                    );
                });
            });

            it('should create diff image not equal to reference if ignore caret is disabled', (done) => {
                looksSame.createDiff({
                    reference: srcPath('no-caret.png'),
                    current: srcPath('caret.png'),
                    diff: this.tempName,
                    highlightColor: '#FF00FF',
                    ignoreCaret: false
                }, () => {
                    looksSame(
                        srcPath('no-caret.png'), this.tempName, {ignoreCaret: false},
                        (error, {equal}) => {
                            expect(error).to.equal(null);
                            expect(equal).to.equal(false);
                            done();
                        }
                    );
                });
            });
        });

        it('should create diff image not equal to reference if there is diff not in caret', (done) => {
            looksSame.createDiff({
                reference: srcPath('no-caret.png'),
                current: srcPath('1px-diff.png'),
                diff: this.tempName,
                highlightColor: '#FF00FF'
            }, () => {
                looksSame(
                    srcPath('no-caret.png'), this.tempName,
                    (error, {equal}) => {
                        expect(error).to.equal(null);
                        expect(equal).to.equal(false);
                        done();
                    }
                );
            });
        });
    });

    it('should create diff image equal to reference if there are diff in antialised pixels and caret', (done) => {
        looksSame.createDiff({
            reference: srcPath('caret+antialiasing.png'),
            current: srcPath('no-caret+antialiasing.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF',
            ignoreAntialiasing: true,
            ignoreCaret: true
        }, () => {
            looksSame(
                srcPath('caret+antialiasing.png'), this.tempName, {ignoreAntialiasing: false},
                (error, {equal}) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                }
            );
        });
    });
});

describe('colors', () => {
    it('should return true for same colors', () => {
        expect(
            looksSame.colors(
                {R: 255, G: 0, B: 0},
                {R: 255, G: 0, B: 0}
            )
        ).to.be.equal(true);
    });

    it('should return false for different colors', () => {
        expect(
            looksSame.colors(
                {R: 255, G: 0, B: 0},
                {R: 0, G: 0, B: 255}
            )
        ).to.be.equal(false);
    });

    it('should return true for similar colors', () => {
        expect(
            looksSame.colors(
                {R: 255, G: 0, B: 0},
                {R: 254, G: 1, B: 1}
            )
        ).to.be.equal(true);
    });

    it('should return false for similar colors if tolerance is low enough', () => {
        expect(
            looksSame.colors(
                {R: 255, G: 0, B: 0},
                {R: 254, G: 1, B: 1},
                {tolerance: 0.0}
            )
        ).to.be.equal(false);
    });

    it('should return true for different colors if tolerance is high enough', () => {
        expect(
            looksSame.colors(
                {R: 255, G: 0, B: 0},
                {R: 0, G: 0, B: 255},
                {tolerance: 55.0}
            )
        ).to.be.equal(true);
    });
});

describe('getDiffArea', () => {
    afterEach(() => sinon.restore());

    it('should format images', (done) => {
        sinon.spy(utils, 'formatImages');

        looksSame.getDiffArea(srcPath('ref.png'), srcPath('same.png'), () => {
            assert.calledOnceWith(utils.formatImages, srcPath('ref.png'), srcPath('same.png'));
            done();
        });
    });

    it('should read formatted images', (done) => {
        const [formattedImg1, formattedImg2] = [{source: srcPath('ref.png')}, {source: srcPath('same.png')}];
        sinon.stub(utils, 'formatImages').returns([formattedImg1, formattedImg2]);
        sinon.spy(utils, 'readPair');

        looksSame.getDiffArea(srcPath('ref.png'), srcPath('same.png'), () => {
            assert.calledOnceWith(utils.readPair, formattedImg1, formattedImg2);
            done();
        });
    });

    it('should return null for similar images', (done) => {
        looksSame.getDiffArea(srcPath('ref.png'), srcPath('same.png'), (error, result) => {
            expect(error).to.equal(null);
            expect(result).to.equal(null);
            done();
        });
    });

    it('should return null for different images when tolerance is higher than difference', (done) => {
        looksSame.getDiffArea(srcPath('ref.png'), srcPath('different.png'), {tolerance: 50}, (error, result) => {
            expect(error).to.equal(null);
            expect(result).to.equal(null);
            done();
        });
    });

    it('should return correct diff area for different images', (done) => {
        looksSame.getDiffArea(srcPath('ref.png'), srcPath('different.png'), {stopOnFirstFail: false}, (error, result) => {
            expect(error).to.equal(null);
            expect(result.right).to.equal(49);
            expect(result.bottom).to.equal(39);
            expect(result.top).to.equal(10);
            expect(result.left).to.equal(0);
            done();
        });
    });

    it('should return sizes of a bigger image if images have different sizes', (done) => {
        looksSame.getDiffArea(srcPath('ref.png'), srcPath('large-different.png'), (error, result) => {
            expect(error).to.equal(null);
            expect(result).to.deep.equal({left: 0, top: 0, right: 499, bottom: 499});
            done();
        });
    });

    it('should return correct diff bounds for images that differ from each other exactly by 1 pixel', (done) => {
        looksSame.getDiffArea(srcPath('no-caret.png'), srcPath('1px-diff.png'), (error, result) => {
            expect(error).to.equal(null);
            expect(result).to.deep.equal({left: 12, top: 6, right: 12, bottom: 6});
            done();
        });
    });
});

describe('getDiffPixelsCoords', () => {
    it('should return all diff area by default', (done) => {
        const [img1, img2] = formatImages(srcPath('ref.png'), srcPath('different.png'));

        readPair(img1, img2).then(pair => {
            getDiffPixelsCoords(pair.first, pair.second, areColorsSame, ({diffArea}) => {
                expect(diffArea.area).to.deep.equal({left: 0, top: 0, right: 49, bottom: 39});
                done();
            });
        });
    });

    it('should return first non-matching pixel if asked for', (done) => {
        const [img1, img2] = formatImages(srcPath('ref.png'), srcPath('different.png'));

        readPair(img1, img2).then(pair => {
            getDiffPixelsCoords(pair.first, pair.second, areColorsSame, {stopOnFirstFail: true}, ({diffArea}) => {
                expect(diffArea.area).to.deep.equal({left: 49, top: 0, right: 49, bottom: 0});
                done();
            });
        });
    });
});
