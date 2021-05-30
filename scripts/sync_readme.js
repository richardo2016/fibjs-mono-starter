/// <reference types="@fibjs/types"/>

const fs = require('fs')
const path = require('path')
const http = require('http')
const ssl = require('ssl')
ssl.loadRootCerts()

const monoInfo = require('../helpers/monoInfo');
const SCOPE_PREFIX = monoInfo.scopePrefix;

const mkdirp = function (inputp) {
    try {
        if (!fs.exists(inputp))
            fs.mkdir(inputp);
    } catch (e) {
        mkdirp(path.dirname(inputp));
        try {
            fs.mkdir(inputp);
        } catch (e) {}
    }
}

const PROJ_ROOT = path.resolve(__dirname, '../');
const hc = new http.Client();

if (process.env.http_proxy) {
    hc.proxyAgent = process.env.http_proxy
} else if (process.env.https_proxy) {
    hc.proxyAgent = process.env.https_proxy
} else {
    hc.proxyAgent = 'http://127.0.0.1:7890'
}

const docs = [
    // standalone packages
    ...[
        {
            ofpackage: 'foo',
            gitpath: 'sindresorhus/cli-spinners',
            isStandalone: true,
        },
    ],
    ...[
        {
            ofpackage: 'subfoo',
            gitpath: 'sindresorhus/ansi-escapes',
            exportedName: 'ansiEscapes',
        },
    ],
];

function replaceInstall (input, {
    origpkgname,
    ofpackage
}) {
    const npmpkgname = `${SCOPE_PREFIX}/${ofpackage}`;
    return input.replace(new RegExp(`npm install ${origpkgname}`, 'g'), `npm install ${npmpkgname}`)
}

function replaceImportAndRequire (input, {
    origpkgname,
    ofpackage,
    exportedName,
    isStandalone,
}) {
    const npmpkgname = `${SCOPE_PREFIX}/${ofpackage}`;
    input = input.replace(new RegExp(`import (.*) from '${origpkgname}'`, 'g'), (_, _1) => {
        if (_1 === exportedName) {
            return `import { ${_1} } from '${npmpkgname}'`
        }
        return `import { ${exportedName} as ${_1} } from '${npmpkgname}'`
    });

    if (isStandalone) {
        input = input.replace(`require('${origpkgname}')`, `require('${npmpkgname}')`);
    } else {
        input = input.replace(
            `const ${exportedName} = require('${origpkgname}')`,
            `const { ${exportedName} } = require('${npmpkgname}')`,
        );
    }

    return input;
}

function replaceMarkdownLinks (input, {
    ofpackage,
    origGitpath,
}) {
    input = input.replace(new RegExp(`github.com/${origGitpath}`, 'g'), `github.com/${monoInfo.gitPath}/tree/master/packages/${ofpackage}`)

    // do some special replace here if you need

    return input
}

/**
 * 
 * @param {string} input 
 * @param {string} paraTitle 
 * @param {number} headLevel 
 * @returns 
 */
function removeParagraphs (input, paraTitleToken, {
    nextParaToken = '#'
} = {}) {
    console.notice(`[removeParagraphs] would replace with token '${paraTitleToken}'`)
    const startIdx = input.indexOf(paraTitleToken)

    if (startIdx === -1)
        return input;

    const preStr = input.slice(0, startIdx);
    const endSearchStart = startIdx + paraTitleToken.length + 1;
    const nextParaIdx = input.slice(endSearchStart).indexOf(nextParaToken)

    // no next '#', no next paragrah
    if (nextParaIdx === -1) {
        return preStr
    }

    return preStr + input.slice(endSearchStart + nextParaIdx)
}

function replaceSpec (input) {
    // do some special replacing here...

    return input;
}

docs.forEach(({
    ofpackage,
    gitpath,
    exportedName,
    isStandalone
}) => {
    const [, name] = gitpath.split('/');
    const readmeurl = `https://raw.githubusercontent.com/${gitpath}/main/readme.md`;
    const gitrepourl = `https://github.com/${gitpath}`;

    const readmeTarget = path.resolve(PROJ_ROOT, `./packages/${ofpackage}/${isStandalone ? 'README.md' : `README/${name}.md`}`);
    let readmeContent = isStandalone ? `\
## ${SCOPE_PREFIX}/${ofpackage}

[![NPM version](https://img.shields.io/npm/v/${SCOPE_PREFIX}/${ofpackage}.svg)](https://www.npmjs.org/package/${SCOPE_PREFIX}/${ofpackage})

This repo is migration from https://github.com/${gitpath}, for fibjs.

` : `\
## require('${SCOPE_PREFIX}/${ofpackage}').${exportedName}

<br>

\`require('${SCOPE_PREFIX}/${ofpackage}').${exportedName}\` is migration from ${gitrepourl}, for fibjs.

`;

    try {
        const res = hc.get(readmeurl)
        if (res.statusCode !== 200) {
            throw new Error(`for ${name}, error http response ${JSON.stringify({ code: res.statusCode, message: res.statusMessage })}`)
        }
        console.notice(`downloaded readme for ${name} success!`)

        let origContent = res.body.readAll().toString()

        origContent = replaceInstall(origContent, { origpkgname: name, ofpackage, exportedName })
        origContent = replaceImportAndRequire(origContent, { origpkgname: name, ofpackage, exportedName, isStandalone })
        origContent = replaceMarkdownLinks(origContent, { ofpackage, origGitpath: gitpath })
        origContent = replaceSpec(origContent)
        origContent = removeParagraphs(origContent, '## Related')
        origContent = removeParagraphs(origContent, '## Maintainers')
        origContent = removeParagraphs(origContent, '## For enterprise')
        // maybe some sponsors information
        origContent = removeParagraphs(origContent, `---

<div align="center">`)
        
        switch (name) {
            case 'log-update': {
                origContent = removeParagraphs(origContent, '## Example')
                break;
            }
            case 'cli-spinners': {
                origContent = removeParagraphs(origContent, '## Preview')

                break;
            }
        }

        readmeContent += `${origContent}\n`;
        
        mkdirp(path.dirname(readmeTarget))
        fs.writeTextFile(readmeTarget, readmeContent)
    } catch (err) {
        console.warn(`err occured for get url '${readmeurl}' for '${name}'`)
        console.warn('readmeTarget is', readmeTarget);

        console.error(err);
    }
})