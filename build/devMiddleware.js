const webpackDev = require('webpack-dev-middleware')
const devMiddleware = (compiler, opts) => {
  const middleware = webpackDev(compiler, opts)
  return async (ctx, next) => {
    await middleware(ctx.req, {
      end: (content) => {
        ctx.body = content
      },
      setHeader: (name, value) => {
        ctx.set(name, value)
      },
      getHeader: () => {
        return ctx
      }
    }, next)
  }
}
module.exports = devMiddleware