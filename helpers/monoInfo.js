const monoPkgJson = require('../package.json')

module.exports = {
    monoPkgJson: monoPkgJson,
    scopePrefix: `@${monoPkgJson.name || monoPkgJson.monoscope}`
}