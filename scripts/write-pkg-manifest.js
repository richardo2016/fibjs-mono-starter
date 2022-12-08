const fs = require('fs')
const path = require('path')

const readdirr = require('@fibjs/fs-readdir-recursive')

const ejs = require('ejs')

const { mkdirp } = require('../helpers/fs');
const monoInfo = require('../helpers/monoInfo')

const monoscope = monoInfo.monoScope
const scopePrefix = monoInfo.scopePrefix
const monoName = monoInfo.monoName

const PKG_DIR = path.resolve(__dirname, '../packages')
const TPL_PDIR = path.resolve(__dirname, '../tpls')
const PKG_JSON_NAME = 'package.json'

const packages = require('../helpers/packages')

const readJson = (jsonpath) => {
  let result = {}
  try {
    result = JSON.parse(fs.readFileSync(jsonpath))
  } catch (error) { }

  return result
}

const prettyJson = (content) => {
  return JSON.stringify(
    content, null, '\t'
  ) + '\n'
}

function normalizePosixPath (fname) {
  return fname.replace(/\\/g, '/')
}

packages.forEach(({
  name: comname,
  no_publish,
  encrypt_package,
  isTopPackage,
  test_dist,
  _dirname,
}) => {
  const comPkgname = _dirname || `${comname}`
  const comDirname = comPkgname
  const comDir = path.resolve(PKG_DIR, `./${comDirname}`)
  if (!fs.existsSync(comDir)) mkdirp(comDir)

  const TPL_DIR = path.resolve(TPL_PDIR, './starter')

  const files = readdirr(TPL_DIR, () => true)
  files.forEach((fname) => {
    const spath = path.resolve(TPL_DIR, fname)
    const tpath = path.resolve(comDir, fname)

    if (!encrypt_package) {
      if (normalizePosixPath(fname).includes('src/unzip.nopwd.ts')) return ;
      if (normalizePosixPath(fname).includes('scripts/unzip-pkg.js')) return ;
    }
    if (test_dist) {
      if (normalizePosixPath(fname).includes('test/index.ts')) return ;
      if (normalizePosixPath(fname).includes('test/test.d.ts')) return ;
    } else {
      if (normalizePosixPath(fname).includes('test/index.js')) return ;
    }

    let existedTargetPkgJson = {}

    const target_existed = fs.exists(tpath)
    if (target_existed) {
      if (![PKG_JSON_NAME, 'tsconfig.json'].includes(fname))
        return ;

      else if (fname === PKG_JSON_NAME)
        existedTargetPkgJson = readJson(tpath)
    }

    const pdir = path.dirname(tpath)
    if (!fs.existsSync(pdir)) mkdirp(pdir)

    const source = fs.readTextFile(spath)

    let output = ejs.render(source, {
      pkg: {
        name: comPkgname,
        npm_name: isTopPackage ? comPkgname : `${scopePrefix}/${comPkgname}`,
        git_group: monoInfo.monoscope,
        git_path: monoInfo.gitPath || `${monoscope}/${monoName}`,
        mono_path: `packages/${comPkgname}`,
        isTopPackage,
      },
      buildmeta: {
        no_publish,
        encrypt_package,
        test_dist,
        type_path: encrypt_package ? 'typings/index.d.ts' : 'lib/index.d.ts'
      }
    })

    if (fname === PKG_JSON_NAME) {
        output = JSON.parse(output)

      if (existedTargetPkgJson.dependencies) {
        output.dependencies =  {
          ...existedTargetPkgJson.dependencies,
          ...output.dependencies,
        }
      }

      if (existedTargetPkgJson.devDependencies) {
        output.devDependencies =  {
          ...existedTargetPkgJson.devDependencies,
          ...output.devDependencies,
        }
      }

      if (existedTargetPkgJson.scripts) {
        output.scripts =  {
          ...existedTargetPkgJson.scripts,
          ...output.scripts,
        }
      }

      if ("private" in existedTargetPkgJson) output.private = existedTargetPkgJson.private
      output.main = existedTargetPkgJson.main || output.main
      output.types = existedTargetPkgJson.types || output.types
      output.version = existedTargetPkgJson.version || output.version
      output.description = existedTargetPkgJson.description || output.description

      output = prettyJson(
        Object.assign({}, existedTargetPkgJson, output)
      )

      if (target_existed && prettyJson(existedTargetPkgJson) === output) return ;
    }
    
    fs.writeTextFile(tpath, output.replace(/\r\n/g, '\n'))

    console.info(`[output] write file ${tpath} successly`)
  })
})

console.info(`write pkg manifest success!`)
