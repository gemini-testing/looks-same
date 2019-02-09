'use strict';

const chai = require('chai');

global.sinon = require('sinon');
global.assert = chai.assert;

chai.use(require('sinon-chai'));
sinon.assert.expose(chai.assert, {prefix: ''});
