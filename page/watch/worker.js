function createWorker (f) {
  const blob = new window.Blob(['(' + f.toString() + ')()'])
  const url = window.URL.createObjectURL(blob)
  const worker = new window.Worker(url)
  return worker
}
const worker = createWorker(function () {
  const _this = this
  let ajaxAPI
  let stopSend = false
  this.onmessage = function (data) {
    const message = JSON.parse(data.data)
    let obj
    if (!message.event) {
      obj = {
        message: '请传入event类型'
      }
      _this.postMessage(JSON.stringify(obj))
      return
    }
    if (message.event === 'init') {
      ajaxAPI = message.data
    } else if (message.event === 'send') {
      const events = message.data
      !stopSend && postEvents(events, ajaxAPI, !!message.isNeedCb)
    }
    function postEvents (params, api, isNeedCb = true) {
      if (!api) {
        return
      }
      const xmlhttp = new _this.XMLHttpRequest()
      xmlhttp.onreadystatechange = function () {
        const httpStatus = xmlhttp.status
        if (xmlhttp.readyState == 4 && httpStatus == 200) {
          const responseText = xmlhttp.responseText
          let response = {}
          if (responseText) {
            response = JSON.parse(responseText)
          }
          if (response.returnFlag) {
            const receivedData = response.resultContent
            const obj = {
              status: 'message',
              event: typeof receivedData === 'string' ? receivedData : JSON.stringify(receivedData)
            }
            if (!isNeedCb) {
              console.log('worker response:', JSON.stringify(obj))
              return
            }
            _this.postMessage(JSON.stringify(obj))
          } else {
            const obj = {
              status: 'error',
              event: null
            }
            _this.postMessage(JSON.stringify(obj))
          }
        }
        // 预留，停止发送处理
        if (httpStatus >= 600) {
          const obj = {
            status: 'error',
            httpStatus,
            event: xmlhttp
          }
          _this.postMessage(JSON.stringify(obj))
          if (httpStatus == 601) {
            stopSend = true
          }
        }
      }
      xmlhttp.addEventListener('error', e => {
        const obj = {
          status: 'error',
          event: `error: ${JSON.stringify(e)}`
        }
        _this.postMessage(JSON.stringify(obj))
      })
      xmlhttp.addEventListener('timeout', () => {
        const obj = {
          status: 'error',
          event: 'timeout'
        }
        _this.postMessage(JSON.stringify(obj))
      })
      xmlhttp.open('POST', api, true)
      xmlhttp.setRequestHeader('Content-type', 'application/json;charset=UTF-8')
      xmlhttp.timeout = 10000
      const _params = typeof params === 'string' ? params : JSON.stringify(params)
      xmlhttp.send(_params)
    }
  }
})

export default worker
