import test = require('test');
test.setup();

import Mod from '../src';

describe("FxLib", () => {
    it("basic", () => {
        assert.ok(Mod === null)
    });
});

test.run(console.DEBUG);
