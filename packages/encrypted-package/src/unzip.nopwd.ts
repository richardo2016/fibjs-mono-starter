import path = require('path')
import child_process = require('child_process')

const pkg = require('../package.json');

const ROOT = path.resolve(__dirname, '../');
const ENTRY = path.resolve(ROOT, './lib/');
const ZIPPATH = path.resolve(ROOT, './lib.zip');

const password = `${pkg.version}-${process.env.FIBJS_MONO_APP_PKG_PWD}`;

child_process.spawn(`unzip`, `-o -P ${password} ${ZIPPATH} -d ${ENTRY}`.split(' '),
    {
        stdio: 'inherit',
        cwd: ROOT
    }
);
