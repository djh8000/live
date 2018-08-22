'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  URL: {
    // api: '"http://edutest.zejicert.cn/"',
    courseApi: '"http://dev.api.course.zejicert.cn"',
    http: '"http://dev.mlive.zejicert.cn/"',
    ws: '"ws://edutest.zejicert.cn:8888"',
    uc: '"http://dev.api.uc.zejicert.cn/"',
    uchttp: '"http://dev.uc.zejicert.cn/"',
    faceurl: '"http://source.dev.zejicert.cn/static/face/"'
  }
})
