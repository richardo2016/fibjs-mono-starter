module.exports = [
    {
        name: 'common',
        _dirname: 'common',
        test_dist: true,
    },
    {
        name: 'encrypted-package',
        _dirname: 'encrypted-package',
        encrypt_package: true
    },
    /* internal module :start */
    {
        name: 'imodule-foo',
        _dirname: 'imodule-foo',
        test_dist: true,
    },
    /* internal module :end */
]