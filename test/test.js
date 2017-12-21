'use strict';

const path = require('path');
const fs = require('fs');
const temp = require('temp');
const expect = require('chai').expect;

const looksSame = require('..');
const png = require('../lib/png');
const utils = require('../lib/utils');
const readPair = utils.readPair;
const getDiffPixelsCoords = utils.getDiffPixelsCoords;
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
    it('should throw if both tolerance and strict options set', () => {
        expect(() => {
            looksSame(srcPath('ref.png'), srcPath('same.png'), {
                strict: true,
                tolerance: 9000
            }, () => {});
        }).to.throw(TypeError);
    });

    forFilesAndBuffers((getImage) => {
        it('should return true for similar images', (done) => {
            looksSame(getImage('ref.png'), getImage('same.png'), (error, equal) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(true);
                done();
            });
        });

        it('should return false for different images', (done) => {
            looksSame(getImage('ref.png'), getImage('different.png'), (error, equal) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should return true for different images when tolerance is higher than difference', (done) => {
            looksSame(getImage('ref.png'), getImage('different.png'), {tolerance: 50}, (error, equal) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(true);
                done();
            });
        });

        it('should return true for different images when difference is not seen by human eye', (done) => {
            looksSame(getImage('ref.png'), getImage('different-unnoticable.png'), (error, equal) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(true);
                done();
            });
        });

        it('should return false if difference is not seen by human eye and strict mode is enabled', (done) => {
            looksSame(getImage('ref.png'), getImage('different-unnoticable.png'), {strict: true}, (error, equal) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should work when images width does not match', (done) => {
            looksSame(getImage('ref.png'), getImage('wide.png'), (error, equal) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should work when images height does not match', (done) => {
            looksSame(getImage('ref.png'), getImage('tall.png'), (error, equal) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        [
            'red',
            'blue',
            'green'
        ].forEach((channel) => {
            it(`should report image as different if the difference is only in ${channel} channel`, (done) => {
                looksSame(getImage('ref.png'), getImage(`${channel}.png`), (error, equal) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });
        });

        it('should return false for images which differ from each other only by 1 pixel', (done) => {
            looksSame(getImage('no-caret.png'), getImage('1px-diff.png'), (error, equal) => {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });
    });

    describe('with ignoreCaret', () => {
        forFilesAndBuffers((getImage) => {
            it('if disabled, should return false for images with caret', (done) => {
                looksSame(getImage('no-caret.png'), getImage('caret.png'), (error, equal) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });

            it('if enabled, should return true for images with caret', (done) => {
                looksSame(getImage('no-caret.png'), getImage('caret.png'), {ignoreCaret: true}, (error, equal) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('if enabled, should return true for images with caret intersecting with a letter', (done) => {
                looksSame(getImage('no-caret+text.png'), getImage('caret+text.png'), {ignoreCaret: true}, (error, equal) => {
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
                looksSame(getImage('caret+antialiasing.png'), getImage('no-caret+antialiasing.png'), opts, (error, equal) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('if enabled, should return false for images with 1px diff', (done) => {
                looksSame(getImage('no-caret.png'), getImage('1px-diff.png'), (error, equal) => {
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
                looksSame(getImage('antialiasing-ref.png'), getImage('antialiasing-actual.png'), (error, equal) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('if disabled, should return false for images with antialiasing', (done) => {
                looksSame(getImage('antialiasing-ref.png'), getImage('antialiasing-actual.png'), {ignoreAntialiasing: false}, (error, equal) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });

            it('if enabled, should return true for images with antialiasing', (done) => {
                looksSame(getImage('antialiasing-ref.png'), getImage('antialiasing-actual.png'), {ignoreAntialiasing: true}, (error, equal) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('should return false for images which differ even with ignore antialiasing option', (done) => {
                looksSame(getImage('no-caret.png'), getImage('1px-diff.png'), {ignoreAntialiasing: true}, (error, equal) => {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
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

    it('should copy a reference image if there is no difference', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('same.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        }, () => {
            looksSame(srcPath('ref.png'), _this.tempName, {strict: true}, (error, equal) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should create an image file a diff for for two images', (done) => {
        const _this = this;
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff',
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
            looksSame(srcPath('ref.png'), _this.tempName, {strict: true}, (error, equal) => {
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
            looksSame(imagePath('diffs/small-magenta.png'), _this.tempName, (error, equal) => {
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
            looksSame(imagePath('diffs/small-green.png'), _this.tempName, (error, equal) => {
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
            looksSame(imagePath('diffs/taller-magenta.png'), _this.tempName, (error, equal) => {
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
            looksSame(imagePath('diffs/wider-magenta.png'), _this.tempName, (error, equal) => {
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
            looksSame(srcPath('ref.png'), _this.tempName, (error, equal) => {
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
            looksSame(imagePath('diffs/strict.png'), _this.tempName, (error, equal) => {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should return a buffer if no diff path option is specified', (done) => {
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            highlightColor: '#ff00ff',
        }, (error, buffer) => {
            expect(buffer).to.be.an.instanceof(Buffer);
            done();
        });
    });

    it('should return a buffer equal to the diff on disk', (done) => {
        looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            highlightColor: '#ff00ff',
        }, (error, buffer) => {
            looksSame(imagePath('diffs/small-magenta.png'), buffer, (error, equal) => {
                expect(equal).to.be.equal(true);
                done();
            });
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
        looksSame.getDiffArea(srcPath('ref.png'), srcPath('different.png'), (error, result) => {
            expect(error).to.equal(null);
            expect(result.width).to.equal(50);
            expect(result.height).to.equal(30);
            expect(result.top).to.equal(10);
            expect(result.left).to.equal(0);
            done();
        });
    });

    it('should return sizes of a bigger image if images have different sizes', (done) => {
        looksSame.getDiffArea(srcPath('ref.png'), srcPath('large-different.png'), (error, result) => {
            expect(error).to.equal(null);
            expect(result.width).to.equal(500);
            expect(result.height).to.equal(500);
            expect(result.top).to.equal(0);
            expect(result.left).to.equal(0);
            done();
        });
    });

    it('should return correct width and height for images that differ from each other exactly by 1 pixel', (done) => {
        looksSame.getDiffArea(srcPath('no-caret.png'), srcPath('1px-diff.png'), (error, result) => {
            expect(error).to.equal(null);
            expect(result.width).to.equal(1);
            expect(result.height).to.equal(1);
            done();
        });
    });
});

describe('getDiffPixelsCoords', () => {
    it('should return all non-matching pixels by default', (done) => {
        readPair(srcPath('ref.png'), srcPath('different.png'), (error, pair) => {
            getDiffPixelsCoords(pair.first, pair.second, areColorsSame, (result) => {
                expect(result.length).to.equal(302);
                done();
            });
        });
    });

    it('should return first non-matching pixel if asked for', (done) => {
        readPair(srcPath('ref.png'), srcPath('different.png'), (error, pair) => {
            getDiffPixelsCoords(pair.first, pair.second, areColorsSame, {stopOnFirstFail: true}, (result) => {
                expect(result.length).to.equal(1);
                done();
            });
        });
    });
});
