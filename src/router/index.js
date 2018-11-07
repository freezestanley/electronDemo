const router = require('koa-router')()
const crypto = require('crypto')
const shell = require('shelljs')
const entryServer = require('../../entry-server.js')

router.get('/', async (ctx, next) => {
  await ctx.render('index')
  await next()
})

router.get('/test', async (ctx, next) => {
  ctx.body = 'this is test'
  // shell.exec('npm run build')
  // shell.mkdir('-p', __dirname + '/file');
  // await next()
})

entryServer(router)

module.exports = router