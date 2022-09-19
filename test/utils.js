'use strict';

const {formatImages, areBuffersEqual, readPair, getDiffPixelsCoords} = require('../lib/utils');
const areColorsSame = require('../lib/same-colors');
const validators = require('../lib/validators');

const path = require('path');

describe('lib/utils', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.stub(validators, 'validateImages');
    });

    afterEach(() => sandbox.restore());

    describe('formatImages', () => {
        it('should validate images', () => {
            formatImages('img1', 'img2');

            assert.calledOnceWith(validators.validateImages, 'img1', 'img2');
        });

        it('should not format images passed as object', () => {
            const [img1, img2] = [{source: 'img-path-1'}, {source: 'img-path-1'}];
            const [formattedImg1, formattedImg2] = formatImages(img1, img2);

            assert.deepEqual(formattedImg1, img1);
            assert.deepEqual(formattedImg2, img2);
        });

        it('should format images passed as buffers', () => {
            const [img1, img2] = [Buffer.from('img-1'), Buffer.from('img-2')];
            const [formattedImg1, formattedImg2] = formatImages(img1, img2);

            assert.deepEqual(formattedImg1, {source: img1, boundingBox: null});
            assert.deepEqual(formattedImg2, {source: img2, boundingBox: null});
        });

        it('should format images passed as strings', () => {
            const [img1, img2] = ['img-path-1', 'img-path-2'];
            const [formattedImg1, formattedImg2] = formatImages(img1, img2);

            assert.deepEqual(formattedImg1, {source: img1, boundingBox: null});
            assert.deepEqual(formattedImg2, {source: img2, boundingBox: null});
        });
    });

    describe('areBuffersEqual', () => {
        it('should return "false" if passed buffers contains "boundingBox" field', () => {
            const [img1, img2] = [
                {buffer: Buffer.from('buf1')},
                {buffer: Buffer.from('buf2'), boundingBox: {top: 1, left: 2, right: 3, bottom: 4}}
            ];

            const res = areBuffersEqual(img1, img2);

            assert.isFalse(res);
        });

        it('should return "false" if passed buffers are not equal', () => {
            const [img1, img2] = [{buffer: Buffer.from('buf1')}, {buffer: Buffer.from('buf2')}];

            const res = areBuffersEqual(img1, img2);

            assert.isFalse(res);
        });

        it('should return "true" if passed buffers are equal', () => {
            const [img1, img2] = [{buffer: Buffer.from('buf')}, {buffer: Buffer.from('buf')}];

            const res = areBuffersEqual(img1, img2);

            assert.isTrue(res);
        });
    });

    describe('getDiffPixelsCoords', () => {
        const srcPath = (name) => path.join(__dirname, 'data', 'src', name);

        it('should return all diff area by default', async () => {
            const [img1, img2] = formatImages(srcPath('ref.png'), srcPath('different.png'));
            const {first, second} = await readPair(img1, img2);

            const {diffArea} = await getDiffPixelsCoords(first, second, areColorsSame);

            assert.deepEqual(diffArea.area, {left: 0, top: 0, right: 49, bottom: 39});
        });

        it('should return first non-matching pixel if asked for', async () => {
            const [img1, img2] = formatImages(srcPath('ref.png'), srcPath('different.png'));
            const {first, second} = await readPair(img1, img2);

            const {diffArea} = await getDiffPixelsCoords(first, second, areColorsSame, {stopOnFirstFail: true});

            assert.deepEqual(diffArea.area, {left: 49, top: 0, right: 49, bottom: 0});
        });
    });
});
