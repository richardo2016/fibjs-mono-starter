#!/usr/bin/env fibjs

const fs = require('fs');
const path = require('path');
const zip = require('zip');

if (!process.env.FIBJS_MONO_APP_PKG_PWD) {
    throw new Error('FIBJS_MONO_APP_PKG_PWD is not set');
}

const PROJ = path.resolve(__dirname, '../');
const DIST = path.resolve(PROJ, './lib/');

const ZIPPATH = path.resolve(PROJ, './lib.zip')

function main() {
    if (!fs.exists(ZIPPATH)) {
        console.notice(`[unzip-pkg] no zip path found, skip unzip [${ZIPPATH}]`);
        return ;
    }

    const zipfile = zip.open(ZIPPATH, "r");

    const pkg = require(path.resolve(PROJ, './package.json'));
    const password = `${pkg.version}-${process.env.FIBJS_MONO_APP_PKG_PWD}`

    fs.mkdir(DIST, { recursive: true });
    zipfile.namelist().forEach((relname) => {
        if (relname.includes('unzip.nopwd.js')) {
            zipfile.extract(relname, path.join(DIST, relname))
        } else {
            zipfile.extract(relname, path.join(DIST, relname), password);
        }
    });
    zipfile.close();
}

main();
