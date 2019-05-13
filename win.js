const {app, BrowserWindow, desktopCapturer} = require('electron')

let mainWindow
function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600})
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL('http://localhost:3000/admin')
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', function () {
    
  })
  mainWindow.on('load', function () {
    console.log('+++load++++++++++++++++')
    mainWindow = null
    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
      for (const source of sources) {
        if (source.name === 'Electron') {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: source.id,
                  minWidth: 1280,
                  maxWidth: 1280,
                  minHeight: 720,
                  maxHeight: 720
                }
              }
            })
            handleStream(stream)
          } catch (e) {
            handleError(e)
          }
          return
        }
      }
    })
    
    function handleStream (stream) {
      const video = document.querySelector('video')
      video.srcObject = stream
      video.onloadedmetadata = (e) => video.play()
    }
    
    function handleError (e) {
      console.log(e)
    }
  })
}
app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})