const createApp = require('/path/to/built-server-bundle.js')
// const createApp = require('./entry-server')
// import createApp from './entry-server'
const renderer = require('vue-server-renderer').createRenderer({
  template: require('fs').readFileSync('./index.template.html', 'utf-8')
})
const path = require('path')

const { createBundleRenderer } = require('vue-server-renderer')
const renderer = createBundleRenderer( serverBundle, {
  runInNewContext: false,
  template: require('fs').readFileSync('./index.template.html', 'utf-8'),
  clientManifest
})

module.exports = function addRoute (router) {
  router.get('*', async (ctx, next) => {
    const context = { url: ctx.url}
    // const app = createApp(context)
    // renderer.renderToString(app, (err, html) => {
    //   console.log(html)
    //   ctx.body = html
    // })

    createApp(context).then(app => {
      renderer.renderToString(app, (err, html) => {
        if (err) {
          if (err.code === 404) {
            ctx.body = 'Page not found'
          } else {
            ctx.body = 'Internal Server Error'
          }
        } else {
          ctx.body = html
        }
      })
    })

    await next()
  })
}