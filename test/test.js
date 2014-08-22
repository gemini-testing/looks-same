'use strict';
var path = require('path'),
    fs = require('fs'),
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
