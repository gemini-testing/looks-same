'use strict';
var path = require('path'),
    fs = require('fs'),
    temp = require('temp'),
    expect = require('chai').expect,

    looksSame = require('..');

function imagePath(name) {
    return path.join(__dirname, 'data', name);
}

function srcPath(name) {
    return path.join(imagePath(path.join('src', name)));
}

function readImage(name) {
    return fs.readFileSync(srcPath(name));
}

function forFilesAndBuffers(callback) {
    describe('with files as arguments', function() {
        callback(srcPath);
    });

    describe('with buffers as arguments', function() {
        callback(readImage);
    });
}

describe('looksSame', function() {
    forFilesAndBuffers(function(getImage) {
        it('should return true for similar images', function(done) {
            looksSame(getImage('ref.png'), getImage('same.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(true);
                done();
            });
        });

        it('should return false for different images', function(done) {
            looksSame(getImage('ref.png'), getImage('different.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should return true for different images when difference is not seen by human eye', function(done) {
            looksSame(getImage('ref.png'), getImage('different-unnoticable.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(true);
                done();
            });
        });

        it('should return false if difference is not seen by human eye and strict mode is enabled', function(done) {
            looksSame(getImage('ref.png'), getImage('different-unnoticable.png'), {strict: true}, function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should work when images width does not match', function(done) {
            looksSame(getImage('ref.png'), getImage('wide.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should work when images height does not match', function(done) {
            looksSame(getImage('ref.png'), getImage('tall.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });
    });

    describe('with ignoreCaret', function() {
        forFilesAndBuffers(function(getImage) {
            it('if disabled, should return false for images with caret', function(done) {
                looksSame(getImage('no-caret.png'), getImage('caret.png'), function(error, equal) {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });

            it('if enabled, should return true for images with caret', function(done) {
                looksSame(getImage('no-caret.png'), getImage('caret.png'), {ignoreCaret: true}, function(error, equal) {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(true);
                    done();
                });
            });

            it('if enabled, should return false if there is more difference, then caret', function(done) {
                looksSame(getImage('no-caret.png'), getImage('not-only-caret.png'), {ignoreCaret: true}, function(error, equal) {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });

            it('if enabled, should return false if there is more then one vertical lines', function(done) {
                looksSame(getImage('no-caret.png'), getImage('two-caret.png'), {ignoreCaret: true}, function(error, equal) {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });

            it('if enabled, should return false if the vertical line has holes in it', function(done) {
                looksSame(getImage('no-caret.png'), getImage('broken-caret.png'), {ignoreCaret: true}, function(error, equal) {
                    expect(error).to.equal(null);
                    expect(equal).to.equal(false);
                    done();
                });
            });
        });
    });
});

describe('saveDiff', function() {
    beforeEach(function() {
        this.tempName = temp.path({suffix: '.png'});
    });

    afterEach(function() {
        if (fs.existsSync(this.tempName)) {
            fs.unlinkSync(this.tempName);
        }
    });

    it('should craate an image file a diff for for two images', function(done) {
        var _this = this;
        looksSame.saveDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        }, function() {
            expect(fs.existsSync(_this.tempName)).to.equal(true);
            done();
        });
    });

    it('should create a proper diff', function(done) {
        var _this = this;
        looksSame.saveDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        }, function() {
            looksSame(imagePath('diffs/small-magenta.png'), _this.tempName, function(error, equal) {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should allow to change highlight color', function(done) {
        var _this = this;
        looksSame.saveDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#00FF00'
        }, function() {
            looksSame(imagePath('diffs/small-green.png'), _this.tempName, function(error, equal) {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should allow to build diff for taller images', function(done) {
        var _this = this;
        looksSame.saveDiff({
            reference: srcPath('ref.png'),
            current: srcPath('tall-different.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF'
        }, function() {
            looksSame(imagePath('diffs/taller-magenta.png'), _this.tempName, function(error, equal) {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should allow to build diff for wider images', function(done) {
        var _this = this;
        looksSame.saveDiff({
            reference: srcPath('ref.png'),
            current: srcPath('wide-different.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF'
        }, function() {
            looksSame(imagePath('diffs/wider-magenta.png'), _this.tempName, function(error, equal) {
                expect(equal).to.equal(true);
                done();
            });
        });
    });
});
