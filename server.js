const Koa = require('koa'),
  bodyParser = require('koa-bodyparser'),
  koaStatic = require('koa-static'),
  views = require('koa-views'),
  onerror = require('koa-onerror'),
  xmlParser = require('koa-xml-parser'),
  path = require('path')
;(logger = require('./src/until/log')), (router = require('./src/router')), (route = require('koa-route'))
websockify = require('koa-websocket')
const compress = require('koa-compress');
const sse = require('koa-sse-stream');

const webpack = require('webpack'),
  webpackconfig = require('./build/webpack.hotdev'),
  devMiddleware = require('./build/devMiddleware'),
  hotMiddleware = require('./build/hotMiddleware'),
  compiler = webpack(webpackconfig),
  fs = require('fs')

const app = websockify(new Koa())
app.use(devMiddleware(compiler))
app.use(hotMiddleware(compiler))

onerror(app)

app.use(koaStatic(path.join(__dirname, './src/static')))
app.use(koaStatic(path.join(__dirname, './dist')))

app.use(compress())
// app.use(sse({
//   maxClients: 5000,
//   pingInterval: 5000
// }));
// app.use(route.all('/sse', async (ctx, next) => {
//   console.log('===============this is /sse ==================') // websocket
//   ctx.sse.send('a notice');
//   ctx.sse.sendEnd();
//   await next()
// }))

// app.use(async (ctx) => {
//   // ctx.sse is a writable stream and has extra method 'send'
//   ctx.sse.send('a notice');
//   ctx.sse.sendEnd();
// });

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

app.use(
  bodyParser({
    enableTypes: ['json', 'form', 'text'],
    formLimit: '50mb',
    textLimit: '50mb'
  })
)

app.use(
  xmlParser({
    limit: '1MB', // Reject payloads larger than 1 MB
    encoding: 'UTF-8', // Explicitly set UTF-8 encoding
    xml: {
      normalize: true, // Trim whitespace inside text nodes
      normalizeTags: true, // Transform tags to lowercase
      explicitArray: false // Only put nodes in array if >1
    }
  })
)

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

app.ws.use(function(ctx, next) {
  // console.dir(ctx)
  return next(ctx)
})
app.ws.use(
  route.all('/test/:id', function(ctx) { // websocket
    ctx.websocket.on('message', function(message) {
      console.log('====' + message + '======')
      // const idList = JSON.parse(message)
      ctx.websocket.send(message)
      // ctx.websocket.send('done')
    })
  })
)
app.use(router.routes())

logger.trace('starting')
logger.trace('listening on port 8080')
logger.error('error')

app.listen(8080)
