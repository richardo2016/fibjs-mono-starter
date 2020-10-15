const fs = require('fs')
const path = require('path')

const { scopePrefix } = require('./monoInfo')

const componentDirs = fs.readdirSync(
    path.resolve(__dirname, '../packages')
)

const externals = [
]

module.exports = {
    externals,
    internalDeps: externals
        .concat(componentDirs.map(com_dname => `${scopePrefix}/${com_dname}`))
}