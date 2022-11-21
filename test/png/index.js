'use strict';

const sinon = require('sinon');
const proxyquire = require('proxyquire');
const fs = require('fs-extra');

const stubBuffer = Buffer.from([123]);

describe('lib/image/index.js', () => {
    const sandbox = sinon.createSandbox();
    let parseError;
    let image;
    let mkSharpImage_;
    beforeEach(() => {
        parseError = null;
        mkSharpImage_ = sandbox.stub();
        image = proxyquire('../../lib/image', {'sharp': mkSharpImage_});

        sandbox.stub(fs, 'readFile').resolves(stubBuffer);
    });

    afterEach(() => sandbox.restore());

    describe('fromFile', () => {
        it('should parse and return sharp instance', async () => {
            await image.fromFile('/filePath');

            assert.calledOnceWith(mkSharpImage_, stubBuffer);
        });

        it('should throw error with file path and original error message at stack', async () => {
            parseError = new Error('test error');
            fs.readFile.withArgs('/filePath').rejects(parseError);

            const error = await assert.isRejected(image.fromFile('/filePath'));

            assert.match(error.message, 'Can\'t load img file /filePath');
            assert.match(error.stack, 'Error: test error');
        });
    });

    it('should create image from raw buffer', async () => {
        const rawBuffer = 'foo';
        const rawOpts = {
            raw: {
                width: 100500,
                height: 500100,
                channels: 42
            }
        };

        await image.fromBuffer(rawBuffer, rawOpts);

        assert.calledOnceWith(mkSharpImage_, rawBuffer, rawOpts);
    });
});
