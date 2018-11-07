const createApp = require('./app')
const renderer = require('vue-server-renderer').createRenderer({
  template: require('fs').readFileSync('./index.template.html', 'utf-8')
})
const path = require('path')

module.exports = function addRoute (router) {
  router.get('*', async (ctx, next) => {
    const context = { url: ctx.url}
    const app = createApp(context)
    renderer.renderToString(app, (err, html) => {
      console.log(html)
      ctx.body = html
    })
    await next()
  })
}