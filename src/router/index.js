const router = require('koa-router')()
const crypto = require('crypto')
const shell = require('shelljs')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const path = require('path')
const folder = path.join(__dirname, 'images')
// const entryServer = require('../vue/server.js')
var i = 0 
function decodeBase64Image(dataString) {
  if (!dataString) return 
  var matches = dataString.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/)
  var response = {}

  if (matches.length !== 3) {
    return new Error('Invalid input string')
  }

  response.type = matches[1]
  response.data = new Buffer(matches[2], 'base64')

  return response
}

function removefolder (pathImg) {
  if (fs.existsSync(pathImg)) {
    files = fs.readdirSync(pathImg);
    files.forEach(function (file, index) {
        var curPath = pathImg + "/" + file;
        if (fs.statSync(curPath).isDirectory()) { // recurse
            fs.rmdirSync(pathImg);
            console.log("文件夹");
        } else { // delete file
            console.log("删除文件",file);
            fs.unlinkSync(curPath,function (err) {
                if (err) throw err;
            });
        }
    });
    fs.rmdirSync(pathImg);
  }
}

router.get('/', async (ctx, next) => {
  await ctx.render('index')
  await next()
})
router.get('/p/:id', async (ctx, next) => {
  await ctx.render('index')
  await next()
})
router.get('/test', async (ctx, next) => {
  ctx.body = 'this is test'
  // shell.exec('npm run build')
  // shell.mkdir('-p', __dirname + '/file');
  // await next()
})
router.post('/images', async (ctx, next) => {
  ctx.body = 'this is test'
  // let imglist = ctx.request.body.split(' ')
  // console.dir(imglist)
  // var folder = 'images/' + timeStamp
  
  // if (!fs.existsSync(resolve(folder))){
  //   fs.mkdirSync(resolve(folder));
  // }

  // removefolder(folder)
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }

  // imglist.map((ele, idx, arr) => {
    // console.log('ele = ' + ele)
    var timeStamp = Date.now()
    var img = decodeBase64Image(ctx.request.body)

    fs.writeFileSync(path.join(folder,`img${++i}.jpg`), img.data, 'base64')
  // })
})

router.get('/create', async (ctx, next) => {
  const ff = require('fluent-ffmpeg')
  var pth = folder
  console.log(__dirname)
  var command = new ff({
    source: path.resolve(__dirname, 'images/img%d%d.jpg'),
    nolog: false
  }).withFps(20).on('end', function (e) {
    console.log(e)
  }).on('error', function (e) {
    console.log(e)
  }).saveToFile(path.join(folder,'movie.avi'))



  // var proc = new ff({ source: path.join(folder + '/img%d.png'), nolog: true })
  //     .withFps(25)
  //     .on('end', function() {
  //       // res.status(200)
  //       // res.send({
  //       //   url: '/video/mpeg/' + timeStamp,
  //       //   filename: 'jianshi' + timeStamp + '.mpeg'
  //       // })
  //       console.log('end')
  //     })
  //     .on('error', function(err) {
  //       console.log('ERR: ' + err.message)
  //       // res.status(500)
  //     })
  //     .saveToFile('./movie.mpeg')
})
router.all('/test/:id', ctx => {
  ctx.body = 'this is test id ' + ctx.params.id
  console.log('================================')
  console.dir(ctx)
})
// entryServer(router)

module.exports = router