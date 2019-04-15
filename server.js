const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const koaStatic = require('koa-static')
const views = require('koa-views')
const onerror = require('koa-onerror')
const xmlParser = require('koa-xml-parser')
const path = require('path')
const logger = require('./src/until/log')
const router = require('./src/router')
const route = require('koa-route')
const websockify = require('koa-websocket')

const webpack = require('webpack')
const webpackconfig = require('./build/webpack.hotdev')
const devMiddleware = require('./build/devMiddleware')
// const hotMiddleware = require('./build/hotMiddleware')
const compiler = webpack(webpackconfig)
// const fs = require('fs')

const app = websockify(new Koa())
app.use(devMiddleware(compiler))
// app.use(hotMiddleware(compiler))

onerror(app)

app.use(koaStatic(path.join(__dirname, './src/static')))
app.use(koaStatic(path.join(__dirname, './dist')))
// logger
app.use(async (ctx, next) => {
  await next()
  const rt = ctx.response.get('X-Response-Time')
  console.log(`${ctx.method} ${ctx.url} - ${rt}`)
})

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

// response
// app.use(async ctx => {
//   ctx.body = 'Hello World';
// });

app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'],
  formLimit: '50mb',
  textLimit: '50mb'
}))

app.use(xmlParser({
  limit: '1MB', // Reject payloads larger than 1 MB
  encoding: 'UTF-8', // Explicitly set UTF-8 encoding
  xml: {
    normalize: true, // Trim whitespace inside text nodes
    normalizeTags: true, // Transform tags to lowercase
    explicitArray: false // Only put nodes in array if >1
  }
}))

app.use(views(path.resolve(__dirname, './src/application')))

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'PUT,DELETE,POST,GET')
  ctx.set('Access-Control-Max-Age', 3600 * 24)
  ctx.set('Access-Control-Allow-Credentials', 'true')
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

  if (ctx.method === 'OPTIONS') {
    ctx.body = ''
  }
  console.log(`${ctx.request.method}: ${ctx.request.url}`)
  await next()
})

app.ws.use(function (ctx, next) {
  // console.dir(ctx)
  return next(ctx)
})
app.ws.use(route.all('/test/:id', function (ctx) {
  ctx.websocket.on('message', function (message) {
    console.log('====' + message + '======')
    ctx.websocket.send(message)
  })
}))
app.use(router.routes())

logger.trace('starting')
logger.trace('listening on port 3000')
logger.error('error')

app.listen(3000)
