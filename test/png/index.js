'use strict';

const sinon = require('sinon');
const fs = require('fs-extra');
const {PNG} = require('pngjs');
const {fromFile} = require('../../lib/png-image');

const stubBuffer = Buffer.from([123]);

describe('lib/png-image/index.js', () => {
    const sandbox = sinon.sandbox.create();
    let parseError;

    beforeEach(() => {
        parseError = null;

        sandbox.stub(fs, 'readFile').resolves(stubBuffer);
        sandbox.stub(PNG.prototype, 'parse').callsFake((buffer, cb) => {
            cb(parseError);
        });
    });

    afterEach(() => sandbox.restore());

    describe('fromFile', () => {
        it('should parse and return PNG', async () => {
            const png = await fromFile('/filePath');

            assert.instanceOf(png._png, PNG);
            assert.calledOnceWith(PNG.prototype.parse, stubBuffer);
        });

        it('should throw error with file path and original error message at stack', async () => {
            parseError = new Error('test error');

            const error = await assert.isRejected(fromFile('/filePath'));

            assert.match(error.message, 'Can\'t load png file /filePath');
            assert.match(error.stack, 'Error: test error');
        });
    });
});
