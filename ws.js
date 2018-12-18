const  bodyParser = require('koa-bodyparser'),
        koaStatic = require('koa-static'),
            views = require('koa-views'),
          onerror = require('koa-onerror'),
        xmlParser = require('koa-xml-parser'),
             path = require('path')
           logger = require('./src/until/log'),
           router = require('koa-route'),
              app = new (require('koa'))(),
       websockify = require('koa-websocket'),
              app = websockify(app)

onerror(app)

let aa = path.join(__dirname, './src/static')
app.use(koaStatic(aa))

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(bodyParser({
  enableTypes:['json', 'form', 'text'],
  formLimit: '50mb',
  textLimit: '50mb'
}))

app.use(xmlParser({
  limit: '1MB',           // Reject payloads larger than 1 MB
  encoding: 'UTF-8',      // Explicitly set UTF-8 encoding
  xml: {
    normalize: true,      // Trim whitespace inside text nodes
    normalizeTags: true,  // Transform tags to lowercase
    explicitArray: false  // Only put nodes in array if >1
  }
}))

app.use(views(path.resolve(__dirname, './src/application')))

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'PUT,DELETE,POST,GET');
  ctx.set('Access-Control-Max-Age', 3600 * 24)
  ctx.set('Access-Control-Allow-Credentials', 'true')
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

  if (ctx.method === 'OPTIONS') {
    ctx.body = '';
  }
  console.log(`${ctx.request.method}: ${ctx.request.url}`)
  await next()
});

logger.trace('starting')
logger.trace('listening on port 3000')
logger.error('error')

app.ws.use(function (ctx, next) {
    return next(ctx)
})

router.all('/socket', function (ctx) {
  ctx.websocket.on('message', function (message) {
      console.log(message)
      // 返回给前端的数据
      ctx.websocket.send(message)
  })
})

router.get('/', async (ctx, next) => {
  await ctx.render('index')
  await next()
})
router.get('/test', async (ctx, next) => {
  ctx.body = 'this is test'
})

router.all('/socket', function (ctx) {
    ctx.websocket.on('message', function (message) {
        console.log(message)
        // 返回给前端的数据
        ctx.websocket.send(message)
    })
})

app.ws.use(router)

app.listen(3000)
console.log('starting')
console.log('listening on port 3000')