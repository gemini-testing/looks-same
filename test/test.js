'use strict';
var path = require('path'),
    fs = require('fs'),
    temp = require('temp'),
    expect = require('chai').expect,

    looksSame = require('..');

function imagePath(name) {
    return path.join(__dirname, 'data', name);
}

function readImage(name) {
    return fs.readFileSync(imagePath(name));
}

function forFilesAndBuffers(callback) {
    describe('with files as arguments', function() {
        callback(imagePath);
    });

    describe('with buffers as arguments', function() {
        callback(readImage);
    });
}

describe('looksSame', function() {
    forFilesAndBuffers(function(getImage) {
        it('should return true for similar images', function(done) {
            looksSame(getImage('image1.png'), getImage('image2.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(true);
                done();
            });
        });

        it('should return false for different images', function(done) {
            looksSame(getImage('image1.png'), getImage('image3.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should return true for different images when difference is not seen by human eye', function(done) {
            looksSame(getImage('image1.png'), getImage('image4.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(true);
                done();
            });
        });

        it('should work when images width does not match', function(done) {
            looksSame(getImage('image1.png'), getImage('image-wide.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
            });
        });

        it('should work when images height does not match', function(done) {
            looksSame(getImage('image1.png'), getImage('image-tall.png'), function(error, equal) {
                expect(error).to.equal(null);
                expect(equal).to.equal(false);
                done();
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
            reference: imagePath('image1.png'),
            current: imagePath('image3.png'),
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
            reference: imagePath('image1.png'),
            current: imagePath('image3.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        }, function() {
            looksSame(imagePath('image1-3_diff_magenta.png'), _this.tempName, function(error, equal) {
                expect(equal).to.equal(true);
                done();
            });
        });
    });

    it('should allow to change highlight color', function(done) {
        var _this = this;
        looksSame.saveDiff({
            reference: imagePath('image1.png'),
            current: imagePath('image3.png'),
            diff: this.tempName,
            highlightColor: '#00FF00'
        }, function() {
            looksSame(imagePath('image1-3_diff_green.png'), _this.tempName, function(error, equal) {
                expect(equal).to.equal(true);
                done();
            });
        });
    });
});
