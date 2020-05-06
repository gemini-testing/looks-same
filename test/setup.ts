import chaiModule from 'chai';
import sinonModule from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import assertExt from './assert-ext';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import mocha from 'mocha';

declare global {
    const sinon: typeof sinonModule;
    const assert: Chai.Assert & sinonModule.SinonAssert & { [key: string]: any };
}

(global as any).sinon = sinonModule;
(global as any).assert = chaiModule.assert;

chaiModule.use(sinonChai);
chaiModule.use(chaiAsPromised);
chaiModule.use(assertExt);

sinonModule.assert.expose(chaiModule.assert, {prefix: ''});
