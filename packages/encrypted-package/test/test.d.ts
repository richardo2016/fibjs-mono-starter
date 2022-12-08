import test = require('test');

// import "@fibjs/types/test";
declare global {
    const describe: typeof test.describe & {
        only: typeof test.odescribe
        skip: typeof test.xdescribe
    };
    const it: typeof test.it & {
        only: typeof test.oit
        skip: typeof test.xit
    };
    const assert: typeof test.assert & {
        throws(block: (...args: any[])=>any, msg?: string): void;
    };
    const before: typeof test.before;
    const beforeEach: typeof test.beforeEach;
    const after: typeof test.after;
    const afterEach: typeof test.afterEach;
}
