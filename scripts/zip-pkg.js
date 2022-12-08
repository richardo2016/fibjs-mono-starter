#!/usr/bin/env fibjs

const fs = require('fs');
const path = require('path');
const zip = require('zip');

const readdir = require('@fibjs/fs-readdir-recursive');

if (!process.env.FIBJS_MONO_APP_PKG_PWD) {
    throw new Error('FIBJS_MONO_APP_PKG_PWD is not set');
}

const PROJ = process.cwd();
if (!path.dirname(PROJ).endsWith('packages')) {
    throw new Error(`package must be in packages directory, but ${PROJ} given.`);
}
const DIST = path.resolve(PROJ, './lib/');

const ZIPPATH = path.resolve(PROJ, './lib.zip')

function main() {
    if (fs.exists(ZIPPATH)) fs.unlink(ZIPPATH);

    const zipfile = zip.open(ZIPPATH, "w");

    const pkg = require(path.resolve(PROJ, './package.json'));
    const password = `${pkg.version}-${process.env.FIBJS_MONO_APP_PKG_PWD}`

    readdir(DIST).forEach(fpath => {
        fpath = fpath.replace(/\\/g, '/').replace(/\/\//g, '/');
        const absPath = path.resolve(DIST, fpath);

        if (!fpath.includes('.nopwd.')) {
            zipfile.write(fs.readFile(absPath), fpath, password);
        } else {
            // TODO: add test to ensure other files encrypted
            zipfile.write(fs.readFile(absPath), fpath);
        }
    });
    zipfile.close();
}

main();
