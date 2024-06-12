'use strict';

const path = require('path');
const fs = require('fs');
const temp = require('temp');
const expect = require('chai').expect;

const looksSame = require('..');
const utils = require('../lib/utils');

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
    const sandbox = sinon.createSandbox();

    afterEach(() => {
        sandbox.restore();
    });

    it('should throw if both tolerance and strict options set', async () => {
        await expect(looksSame(srcPath('ref.png'), srcPath('same.png'), {
            strict: true,
            tolerance: 9000
        })).to.eventually.be.rejectedWith(TypeError);
    });

    it('should work when opts is undefined', async () => {
        await expect(looksSame(srcPath('ref.png'), srcPath('same.png')))
            .to.eventually.be.fulfilled;
    });

    it('should format images', async () => {
        sandbox.spy(utils, 'formatImages');

        await looksSame(srcPath('ref.png'), srcPath('same.png'));

        assert.calledOnceWith(utils.formatImages, srcPath('ref.png'), srcPath('same.png'));
    });

    it('should read formatted images', async () => {
        const [formattedImg1, formattedImg2] = [{source: srcPath('ref.png')}, {source: srcPath('same.png')}];
        sandbox.stub(utils, 'formatImages').returns([formattedImg1, formattedImg2]);
        sandbox.spy(utils, 'readPair');

        await looksSame(srcPath('ref.png'), srcPath('same.png'));

        assert.calledOnceWith(utils.readPair, formattedImg1, formattedImg2);
    });

    forFilesAndBuffers((getImage) => {
        it('should return true for similar images (compare only by buffers)', async () => {
            sandbox.stub(utils, 'getDiffPixelsCoords');

            const {equal} = await looksSame(getImage('ref.png'), getImage('same.png'));

            assert.isTrue(equal);
            assert.notCalled(utils.getDiffPixelsCoords);
        });

        it('should return false for different images (compare by img pixels)', async () => {
            sandbox.spy(utils, 'getDiffPixelsCoords');

            const {equal} = await looksSame(getImage('ref.png'), getImage('different.png'));

            assert.isFalse(equal);
            assert.calledOnce(utils.getDiffPixelsCoords);
        });

        it('should return reference image for different images', async () => {
            const {metaInfo: {refImg}} = await looksSame(getImage('ref.png'), getImage('different.png'));

            expect(refImg).to.deep.equal({size: {width: 50, height: 50}});
        });

        it('should return reference image for equal images', async () => {
            const {metaInfo: {refImg}} = await looksSame(getImage('ref.png'), getImage('ref.png'));

            expect(refImg).to.deep.equal({size: {width: 50, height: 50}});
        });

        it('should return diff bounds for different images', async () => {
            const {diffBounds} = await looksSame(getImage('ref.png'), getImage('different.png'));

            expect(diffBounds).to.deep.equal({left: 0, top: 10, right: 49, bottom: 39});
        });

        it('should return true for different images when tolerance is higher than difference', async () => {
            const {equal} = await looksSame(getImage('ref.png'), getImage('different.png'), {tolerance: 50});

            expect(equal).to.equal(true);
        });

        it('should return true for different images when difference is not seen by human eye', async () => {
            const {equal} = await looksSame(getImage('ref.png'), getImage('different-unnoticable.png'));

            expect(equal).to.equal(true);
        });

        it('should return false if difference is not seen by human eye and strict mode is enabled', async () => {
            const {equal} = await looksSame(getImage('ref.png'), getImage('different-unnoticable.png'), {strict: true});

            expect(equal).to.equal(false);
        });

        it('should work when images width does not match', async () => {
            const {equal} = await looksSame(getImage('ref.png'), getImage('wide.png'));

            expect(equal).to.equal(false);
        });

        it('should work when images height does not match', async () => {
            const {equal} = await looksSame(getImage('ref.png'), getImage('tall.png'));

            expect(equal).to.equal(false);
        });

        it('should return diff bound equal to a bigger image if images have different sizes', async () => {
            const {equal, diffBounds} = await looksSame(srcPath('ref.png'), srcPath('large-different.png'));

            expect(equal).to.equal(false);
            expect(diffBounds).to.deep.equal({left: 0, top: 0, right: 499, bottom: 499});
        });

        it('should return single diff cluster equal to a bigger image if images have different sizes', async () => {
            const {equal, diffClusters} = await looksSame(srcPath('ref.png'), srcPath('large-different.png'));

            expect(equal).to.equal(false);
            expect(diffClusters).to.deep.equal([{left: 0, top: 0, right: 499, bottom: 499}]);
        });

        [
            'red',
            'blue',
            'green'
        ].forEach((channel) => {
            it(`should report image as different if the difference is only in ${channel} channel`, async () => {
                const {equal} = await looksSame(getImage('ref.png'), getImage(`${channel}.png`));

                expect(equal).to.equal(false);
            });
        });

        it('should return false for images which differ from each other only by 1 pixel', async () => {
            const {equal} = await looksSame(getImage('no-caret.png'), getImage('1px-diff.png'));

            expect(equal).to.equal(false);
        });
    });

    describe('with comparing by areas', () => {
        forFilesAndBuffers((getImage) => {
            describe('if passed areas have different sizes', () => {
                it('should return "false"', async () => {
                    const {equal} = await looksSame(
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 2, bottom: 1}},
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 5, top: 5, right: 5, bottom: 6}}
                    );

                    assert.isFalse(equal);
                });

                it('should return diff bound for first image equal to a bigger area', async () => {
                    const {diffBounds} = await looksSame(
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 2, bottom: 1}},
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 5, top: 5, right: 5, bottom: 6}}
                    );

                    assert.deepEqual(diffBounds, {left: 1, top: 1, right: 2, bottom: 2});
                });
            });

            describe('if passed areas have the same sizes but located in various places', () => {
                it('should return true if images are equal', async () => {
                    const {equal} = await looksSame(
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 4, bottom: 4}},
                        {source: getImage('bounding-box-diff-2.png'), boundingBox: {left: 5, top: 5, right: 8, bottom: 8}}
                    );

                    assert.isTrue(equal);
                });

                it('should return false if images are different', async () => {
                    const {equal} = await looksSame(
                        {source: getImage('bounding-box-ref-1.png'), boundingBox: {left: 1, top: 1, right: 4, bottom: 4}},
                        {source: getImage('bounding-box-ref-2.png'), boundingBox: {left: 5, top: 5, right: 8, bottom: 8}}
                    );

                    assert.isFalse(equal);
                });

                it('should return diff bound for first image if images are different', async () => {
                    const {diffBounds} = await looksSame(
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 2, bottom: 1}},
                        {source: getImage('bounding-box-diff-1.png'), boundingBox: {left: 5, top: 5, right: 5, bottom: 6}}
                    );

                    assert.deepEqual(diffBounds, {left: 1, top: 1, right: 2, bottom: 2});
                });
            });
        });
    });

    describe('with ignoreCaret', () => {
        forFilesAndBuffers((getImage) => {
            it('should ignore caret by default', async () => {
                const {equal} = await looksSame(getImage('no-caret.png'), getImage('caret.png'));

                expect(equal).to.equal(true);
            });

            it('if disabled, should return false for images with caret', async () => {
                const {equal} = await looksSame(getImage('no-caret.png'), getImage('caret.png'), {ignoreCaret: false});

                expect(equal).to.equal(false);
            });

            it('if enabled, should return true for images with caret', async () => {
                const {equal} = await looksSame(getImage('no-caret.png'), getImage('caret.png'), {ignoreCaret: true});

                expect(equal).to.equal(true);
            });

            it('if enabled, should return true for images with caret intersecting with a letter', async () => {
                const {equal} = await looksSame(getImage('no-caret+text.png'), getImage('caret+text.png'), {ignoreCaret: true});

                expect(equal).to.equal(true);
            });

            it('if enabled, should return true for images with caret and antialiased pixels', async () => {
                const {equal} = await looksSame(getImage('caret+antialiasing.png'), getImage('no-caret+antialiasing.png'), {
                    ignoreCaret: true,
                    ignoreAntialiasing: true
                });

                expect(equal).to.equal(true);
            });

            it('if enabled, should return false for images with 1px diff', async () => {
                const {equal} = await looksSame(getImage('no-caret.png'), getImage('1px-diff.png'));

                expect(equal).to.equal(false);
            });
        });
    });

    describe('with antialiasing', () => {
        forFilesAndBuffers((getImage) => {
            it('should check images for antialiasing by default', async () => {
                const {equal} = await looksSame(getImage('antialiasing-ref.png'), getImage('antialiasing-actual.png'));

                expect(equal).to.equal(true);
            });

            it('if disabled, should return false for images with antialiasing', async () => {
                const {equal} = await looksSame(
                    getImage('antialiasing-ref.png'),
                    getImage('antialiasing-actual.png'),
                    {ignoreAntialiasing: false}
                );

                expect(equal).to.equal(false);
            });

            it('if enabled, should return true for images with antialiasing', async () => {
                const {equal} = await looksSame(
                    getImage('antialiasing-ref.png'),
                    getImage('antialiasing-actual.png'),
                    {ignoreAntialiasing: true}
                );

                expect(equal).to.equal(true);
            });

            it('should return false for images which differ even with ignore antialiasing option', async () => {
                const {equal} = await looksSame(
                    getImage('no-caret.png'),
                    getImage('1px-diff.png'),
                    {ignoreAntialiasing: true}
                );

                expect(equal).to.equal(false);
            });

            [1, 2].forEach((ind) => {
                it('should return false for images with default "antialiasingTolerance"', async () => {
                    const {equal} = await looksSame(
                        getImage(`antialiasing-tolerance-ref-${ind}.png`),
                        getImage(`antialiasing-tolerance-actual-${ind}.png`),
                        {ignoreAntialiasing: true, ignoreCaret: false}
                    );

                    expect(equal).to.equal(false);
                });

                it('should return true for images with passed "antialiasingTolerance"', async () => {
                    const {equal} = await looksSame(
                        getImage(`antialiasing-tolerance-ref-${ind}.png`),
                        getImage(`antialiasing-tolerance-actual-${ind}.png`),
                        {antialiasingTolerance: 4}
                    );

                    expect(equal).to.equal(true);
                });
            });
        });
    });
});

describe('createDiff', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        this.tempName = temp.path({suffix: '.png'});
    });

    afterEach(() => {
        if (fs.existsSync(this.tempName)) {
            fs.unlinkSync(this.tempName);
        }

        sandbox.restore();
    });

    it('should throw if both tolerance and strict options set', async () => {
        await expect(looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff',
            tolerance: 9000,
            strict: true
        })).to.eventually.be.rejectedWith(TypeError);
    });

    it('should format images', async () => {
        sandbox.spy(utils, 'formatImages');

        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('same.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        });

        assert.calledOnceWith(utils.formatImages, srcPath('ref.png'), srcPath('same.png'));
    });

    it('should read formatted images', async () => {
        const [formattedImg1, formattedImg2] = [{source: srcPath('ref.png')}, {source: srcPath('same.png')}];
        sandbox.stub(utils, 'formatImages').returns([formattedImg1, formattedImg2]);
        sandbox.spy(utils, 'readPair');

        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('same.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        });

        assert.calledOnceWith(utils.readPair, formattedImg1, formattedImg2);
    });

    it('should copy a reference image if there is no difference', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('same.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        });

        const {equal} = await looksSame(srcPath('ref.png'), this.tempName, {strict: true});

        expect(equal).to.equal(true);
    });

    it('should create an image file with diff between two images', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        });

        expect(fs.existsSync(this.tempName)).to.equal(true);
    });

    it('should ignore the differences lower then tolerance', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff',
            tolerance: 50
        });

        const {equal} = await looksSame(srcPath('ref.png'), this.tempName, {strict: true});

        expect(equal).to.equal(true);
    });

    it('should create a proper diff', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        });

        const {equal} = await looksSame(imagePath('diffs/small-magenta.png'), this.tempName);

        expect(equal).to.equal(true);
    });

    it('should allow to change highlight color', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#00FF00'
        });

        const {equal} = await looksSame(imagePath('diffs/small-green.png'), this.tempName);

        expect(equal).to.equal(true);
    });

    it('should provide a default highlight color', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName
        });

        const {equal} = await looksSame(imagePath('diffs/small-magenta.png'), this.tempName);

        expect(equal).to.equal(true);
    });

    it('should allow to build diff for taller images', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('tall-different.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF'
        });

        const {equal} = await looksSame(imagePath('diffs/taller-magenta.png'), this.tempName);

        expect(equal).to.equal(true);
    });

    it('should allow to build diff for wider images', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('wide-different.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF'
        });

        const {equal} = await looksSame(imagePath('diffs/wider-magenta.png'), this.tempName);

        expect(equal).to.equal(true);
    });

    it('should use non-strict comparator by default', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different-unnoticable.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF'
        });

        const {equal} = await looksSame(srcPath('ref.png'), this.tempName);

        expect(equal).to.equal(true);
    });

    it('should use strict comparator if strict option is true', async () => {
        await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different-unnoticable.png'),
            diff: this.tempName,
            strict: true,
            highlightColor: '#FF00FF'
        });

        const {equal} = await looksSame(imagePath('diffs/strict.png'), this.tempName);

        expect(equal).to.equal(true);
    });

    it('should return a buffer if no diff path option is specified', async () => {
        const buffer = await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            highlightColor: '#ff00ff'
        });

        expect(buffer).to.be.an.instanceof(Buffer);
    });

    it('should return a buffer equal to the diff on disk', async () => {
        const buffer = await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            highlightColor: '#ff00ff'
        });

        const {equal} = await looksSame(imagePath('diffs/small-magenta.png'), buffer);

        expect(equal).to.be.equal(true);
    });

    it('should return an equal property if the diff path option is specified', async () => {
        const equalResponse = await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('same.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        });
        const notEqualResponse = await looksSame.createDiff({
            reference: srcPath('ref.png'),
            current: srcPath('different.png'),
            diff: this.tempName,
            highlightColor: '#ff00ff'
        });

        expect(equalResponse).to.have.property('equal', true);
        expect(notEqualResponse).to.have.property('equal', false);
    });

    describe('with comparing by areas', () => {
        it('should create diff image equal to reference', async () => {
            await looksSame.createDiff({
                reference: {source: srcPath('bounding-box-ref-1.png'), boundingBox: {left: 1, top: 1, right: 4, bottom: 4}},
                current: {source: srcPath('bounding-box-ref-2.png'), boundingBox: {left: 5, top: 5, right: 8, bottom: 8}},
                diff: this.tempName,
                highlightColor: '#FF00FF'
            });

            const {equal} = await looksSame(
                {source: srcPath('bounding-box-diff-1.png'), boundingBox: {left: 1, top: 1, right: 4, bottom: 4}},
                this.tempName
            );

            assert.isTrue(equal, true);
        });
    });

    describe('with antialiasing', () => {
        describe('if there is only diff in antialiased pixels', () => {
            it('should create diff image equal to reference if ignore antialiasing is not set', async () => {
                await looksSame.createDiff({
                    reference: srcPath('antialiasing-ref.png'),
                    current: srcPath('antialiasing-actual.png'),
                    diff: this.tempName,
                    highlightColor: '#FF00FF'
                });

                const {equal} = await looksSame(srcPath('antialiasing-ref.png'), this.tempName, {ignoreAntialiasing: false});

                expect(equal).to.equal(true);
            });

            it('should create diff image not equal to reference if ignore antialiasing is disabled', async () => {
                await looksSame.createDiff({
                    reference: srcPath('antialiasing-ref.png'),
                    current: srcPath('antialiasing-actual.png'),
                    diff: this.tempName,
                    highlightColor: '#FF00FF',
                    ignoreAntialiasing: false
                });

                const {equal} = await looksSame(srcPath('antialiasing-ref.png'), this.tempName, {ignoreAntialiasing: false});

                expect(equal).to.equal(false);
            });
        });

        it('should create diff image not equal to reference if there is diff not in antialised pixels', async () => {
            await looksSame.createDiff({
                reference: srcPath('no-caret.png'),
                current: srcPath('1px-diff.png'),
                diff: this.tempName,
                highlightColor: '#FF00FF'
            });

            const {equal} = await looksSame(srcPath('antialiasing-ref.png'), this.tempName);

            expect(equal).to.equal(false);
        });
    });

    describe('with ignoreCaret', () => {
        describe('if there is only diff in caret', () => {
            it('should create diff image equal to reference if ignore caret is not set', async () => {
                await looksSame.createDiff({
                    reference: srcPath('no-caret.png'),
                    current: srcPath('caret.png'),
                    diff: this.tempName,
                    highlightColor: '#FF00FF'
                });

                const {equal} = await looksSame(srcPath('no-caret.png'), this.tempName, {ignoreCaret: false});

                expect(equal).to.equal(true);
            });

            it('should create diff image not equal to reference if ignore caret is disabled', async () => {
                await looksSame.createDiff({
                    reference: srcPath('no-caret.png'),
                    current: srcPath('caret.png'),
                    diff: this.tempName,
                    highlightColor: '#FF00FF',
                    ignoreCaret: false
                });

                const {equal} = await looksSame(srcPath('no-caret.png'), this.tempName, {ignoreCaret: false});

                expect(equal).to.equal(false);
            });
        });

        it('should create diff image not equal to reference if there is diff not in caret', async () => {
            await looksSame.createDiff({
                reference: srcPath('no-caret.png'),
                current: srcPath('1px-diff.png'),
                diff: this.tempName,
                highlightColor: '#FF00FF'
            });

            const {equal} = await looksSame(srcPath('no-caret.png'), this.tempName);

            expect(equal).to.equal(false);
        });
    });

    it('should create diff image equal to reference if there are diff in antialised pixels and caret', async () => {
        await looksSame.createDiff({
            reference: srcPath('caret+antialiasing.png'),
            current: srcPath('no-caret+antialiasing.png'),
            diff: this.tempName,
            highlightColor: '#FF00FF',
            ignoreAntialiasing: true,
            ignoreCaret: true
        });

        const {equal} = await looksSame(srcPath('caret+antialiasing.png'), this.tempName, {ignoreAntialiasing: false});

        expect(equal).to.equal(true);
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
    const sandbox = sinon.createSandbox();

    afterEach(() => sandbox.restore());

    it('should format images', async () => {
        sandbox.spy(utils, 'formatImages');

        await looksSame.getDiffArea(srcPath('ref.png'), srcPath('same.png'));

        assert.calledOnceWith(utils.formatImages, srcPath('ref.png'), srcPath('same.png'));
    });

    it('should read formatted images', async () => {
        const [formattedImg1, formattedImg2] = [{source: srcPath('ref.png')}, {source: srcPath('same.png')}];
        sandbox.stub(utils, 'formatImages').returns([formattedImg1, formattedImg2]);
        sandbox.spy(utils, 'readPair');

        await looksSame.getDiffArea(srcPath('ref.png'), srcPath('same.png'));

        assert.calledOnceWith(utils.readPair, formattedImg1, formattedImg2);
    });

    it('should return null for similar images', async () => {
        const result = await looksSame.getDiffArea(srcPath('ref.png'), srcPath('same.png'));

        expect(result).to.equal(null);
    });

    it('should return null for different images when tolerance is higher than difference', async () => {
        const result = await looksSame.getDiffArea(srcPath('ref.png'), srcPath('different.png'), {tolerance: 50});

        expect(result).to.equal(null);
    });

    it('should return correct diff area for different images', async () => {
        const result = await looksSame.getDiffArea(srcPath('ref.png'), srcPath('different.png'), {stopOnFirstFail: false});

        expect(result.right).to.equal(49);
        expect(result.bottom).to.equal(39);
        expect(result.top).to.equal(10);
        expect(result.left).to.equal(0);
    });

    it('should return sizes of a bigger image if images have different sizes', async () => {
        const result = await looksSame.getDiffArea(srcPath('ref.png'), srcPath('large-different.png'));

        expect(result).to.deep.equal({left: 0, top: 0, right: 499, bottom: 499});
    });

    it('should return correct diff bounds for images that differ from each other exactly by 1 pixel', async () => {
        const result = await looksSame.getDiffArea(srcPath('no-caret.png'), srcPath('1px-diff.png'));

        expect(result).to.deep.equal({left: 12, top: 6, right: 12, bottom: 6});
    });
});
