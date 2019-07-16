// import { ProxyEvent, getXpath } from 'event-shadow'
import Pform from './preformance'
import Hook from 'ajax-hook'
// import EventSource from 'eventsource'
// import axios from 'axios'

// let result = pf.getPerformanceInfo()
// window.jQuery.get('http://localhost:3000/test', function (data, status) {
//   alert('数据: ' + data + '\n状态: ' + status)
// })
/*
window.jQuery.ajax({
  type: 'POST',
  url: 'http://localhost:3000/test',
  data: bigEye.result,
  success: function (data, state, xhr) {
    debugger
    console.log(data, state, xhr)
  }
});
*/
class Eye {
  constructor () {
    let _self = this
    this.result = {}
    this.pf = window.pf = new Pform({ eventCallback: (e, o) => {
      _self.pushMessage(e.getEntries())
    } })
    this.result['timing'] = this.pf.getTiming()
    this.result['navigation'] = this.pf.getNavigation()
    this.result['resource'] = []
    this.result['error'] = {
      code: [],
      source: []
    }
    this.result['ajax'] = []
    this.result['fetch'] = []
    window.addEventListener('load', function (e) {
      _self.pf.observe()
      _self.pushMessage(_self.pf.getResource())
    })
    this.init()
  }
  init () {
    this.monitorAjax()
    this.monitorError()
    // this.sourceEvent()
  }
  sourceEvent () {
    var es = new EventSource('http://localhost:8080/sse')
    es.reconnectInterval = 30000
    es.addEventListener('message', (e, ca) => {
      console.log('this is message')
      console.log(e)
    })
    // es.addEventListener('server-time', function (e) {
    //   debugger
    //   console.log(e.data)
    // })
  }
  pushMessage (e, t = 'resource', t2) {
    let result = Array.isArray(e)
    if (result) {
      if (t2) {
        this.result[t][t2] = this.result[t][t2].concat(e)
      } else {
        this.result[t] = this.result[t].concat(e)
      }
    } else {
      if (t2) {
        this.result[t][t2].push(e)
      } else {
        this.result[t].push(e)
      }
    }
    // console.log('======================')
    // console.log(JSON.stringify(this.result))
  }
  monitorAjax () {
    let _self = this
    Hook.hookAjax({
      open: function (arg) {
        let result = {
          method: arg[0],
          url: arg[1],
          async: arg[2]
        }
        _self.pushMessage(result, 'ajax')
      }
    })
    if (window.fetch) {
      let Fth = window.fetch
      window.fetch = function (input, init) {
        _self.pushMessage({ input, init }, 'fetch')
        return Fth(input, init)
      }
    }
  }
  monitorError () {
    let _self = this
    window.addEventListener('error', function (evt) {
      let result = {}
      if (evt.toString() === '[object ErrorEvent]') {
        result.message = evt.message
        result.colno = evt.colno
        result.lineno = evt.lineno
        result.file = evt.filename
        result.type = 'script'
        _self.pushMessage(result, 'error', 'code')
      } else {
        result.src = evt.target.src
        result.type = evt.target.localName
        _self.pushMessage(result, 'error', 'source')
      }
    }, true)

    let oldError = console.error
    console.error = function (tempErrorMsg) {
      let errorMsg = (arguments[0] && arguments[0].message) || tempErrorMsg
      let lineNumber = 0
      let columnNumber = 0
      let errorObj = arguments[0] && arguments[0].stack
      let result = {}
      if (!errorObj) {
        // console.log(errorMsg, lineNumber, columnNumber)
        result.errorMsg = errorMsg
        result.lineno = lineNumber
        result.colno = columnNumber
        result.type = 'script'
        _self.pushMessage(result, 'error', 'code')
      } else {
        result.errorMsg = errorMsg
        result.lineno = lineNumber
        result.colno = columnNumber
        result.type = 'script'
        result.errorObj = errorObj
        _self.pushMessage(result, 'error', 'code')
      }
      return oldError.apply(console, arguments)
    }

    window.onunhandledrejection = function (e) {
      let errorMsg = ''
      let errorStack = ''
      if (typeof e.reason === 'object') {
        errorMsg = e.reason.message
        errorStack = e.reason.stack
      } else {
        errorMsg = e.reason
        errorStack = ''
      }
      _self.pushMessage({ errorMsg, errorStack }, 'error', 'code')
      // console.log(errorMsg, errorStack)
      // siftAndMakeUpMessage('on_error', errorMsg, WEB_LOCATION, 0, 0, 'UncaughtInPromiseError: ' + errorStack)
    }
  }
  monitorPf () {

  }
}
let bigEye = window.bigEye = new Eye()
console.log(bigEye)
// window.addEventListener('load', function (e) {
//   console.log('ffffffffffffffff')
//   this.pf.observe()
//   this.pf.clear()
//   window.jQuery.get('http://localhost:3000/test', function (data, status) {
//     alert('数据: ' + data + '\n状态: ' + status)
//   })
// })

// function recordHttpLog () {
//   console.log('============ffff====================')
//   // 监听ajax的状态
//   function ajaxEventTrigger (event) {
//     var ajaxEvent = new CustomEvent(event, {
//       detail: this
//     })
//     window.dispatchEvent(ajaxEvent)
//   }

//   let Oldxhr = window.XMLHttpRequest
//   function newXHR () {
//     var realXHR = new Oldxhr()
//     realXHR.addEventListener('abort', function () { ajaxEventTrigger.call(this, 'ajaxAbort') }, false)
//     realXHR.addEventListener('error', function () { ajaxEventTrigger.call(this, 'ajaxError') }, false)
//     realXHR.addEventListener('load', function () { ajaxEventTrigger.call(this, 'ajaxLoad') }, false)
//     realXHR.addEventListener('loadstart', function () { ajaxEventTrigger.call(this, 'ajaxLoadStart') }, false)
//     realXHR.addEventListener('progress', function () { ajaxEventTrigger.call(this, 'ajaxProgress') }, false)
//     realXHR.addEventListener('timeout', function () { ajaxEventTrigger.call(this, 'ajaxTimeout') }, false)
//     realXHR.addEventListener('loadend', function () { ajaxEventTrigger.call(this, 'ajaxLoadEnd') }, false)
//     realXHR.addEventListener('readystatechange', function () { ajaxEventTrigger.call(this, 'ajaxReadyStateChange') }, false)
//     // 此处的捕获的异常会连日志接口也一起捕获，如果日志上报接口异常了，就会导致死循环了。
//     // realXHR.onerror = function () {
//     //   siftAndMakeUpMessage("Uncaught FetchError: Failed to ajax", WEB_LOCATION, 0, 0, {});
//     // }
//     return realXHR
//   }

//   var timeRecordArray = []
//   window.XMLHttpRequest = newXHR
//   window.addEventListener('ajaxLoadStart', function (e) {
//     var tempObj = {
//       timeStamp: new Date().getTime(),
//       event: e
//     }
//     timeRecordArray.push(tempObj)
//   })

//   window.addEventListener('ajaxLoadEnd', function () {
//     for (var i = 0; i < timeRecordArray.length; i++) {
//       if (timeRecordArray[i].event.detail.status > 0) {
//         let currentTime = new Date().getTime()
//         let url = timeRecordArray[i].event.detail.responseURL
//         let status = timeRecordArray[i].event.detail.status
//         let statusText = timeRecordArray[i].event.detail.statusText
//         let loadTime = currentTime - timeRecordArray[i].timeStamp
//         // if (!url || url.indexOf(HTTP_UPLOAD_LOG_API) != -1) return
//         // var httpLogInfoStart = new HttpLogInfo(HTTP_LOG, url, status, statusText, '发起请求', timeRecordArray[i].timeStamp, 0)
//         // httpLogInfoStart.handleLogInfo(HTTP_LOG, httpLogInfoStart)
//         // var httpLogInfoEnd = new HttpLogInfo(HTTP_LOG, url, status, statusText, '请求返回', currentTime, loadTime)
//         // httpLogInfoEnd.handleLogInfo(HTTP_LOG, httpLogInfoEnd)
//         // 当前请求成功后就在数组中移除掉
//         // timeRecordArray.splice(i, 1)
//         console.log(url + '=' + status + '=' + statusText + '=' + loadTime)
//       }
//     }
//   })
// }

// class Eye {
//   constructor () {
//     this.bank = []
//   }
// }
// class Eye {
//   constructor () {
//     this.bank = {
//       error: [],
//       action: [],
//       performance: [],
//       environment: {}
//     }
//   }
//   // get infoBank () {
//   //   return this.bank
//   // }
//   // set infoBank (val) {
//   //   this.bank = val
//   // }

//   init () {
//     this.addError()
//     this.getEnvir()
//     this.getAction()
//     // this.intervalPush()
//     window.addEventListener('click', (e) => {
//       console.log(e)
//     })
//   }
//   intervalPush () {
//     // let bank = this.bank
//     // let dataKey = Object.keys(bank.environment)
//     // bank.environment = Pformance.perInfo
//     // bank.performance = [...bank.performance, ...Pformance.getEnt]
//     // if (bank.error.length <= 0 && bank.action.length <= 0 && bank.performance.length <= 0 && dataKey.length <= 0) {
//     //   return
//     // }
//     let _self = this
//     window.setInterval((e) => {
//       // console.log(_self.bank)
//       _self.bank.performance = [..._self.bank.performance, ...Pformance.getEnt]
//       axios.post('/v1/saveWebMonitorLog', _self.bank).then(function (response) {
//         _self.bank.error = []
//         _self.bank.action = []
//         _self.bank.performance = []
//         _self.bank.environment = {}
//       })
//     }, 5000)
//   }
//   pushData () {
//     let _self = this
//     let data = _self.bank
//     let dataKey = Object.keys(data.environment)
//     let bank = this.bank
//     // bank.environment = Pformance.perInfo
//     bank.performance = [...bank.performance, ...Pformance.getEnt]

//     if (data.error.length <= 0 && data.action.length <= 0 && data.performance.length <= 0 && dataKey.length <= 0) {
//       return
//     }
//     _self.bank = {
//       error: [],
//       action: [],
//       performance: [],
//       environment: {}
//     }
//     // console.log('fffff')
//     // axios.post('/v1/saveWebMonitorLog', data).then(function (response) {
//     //   _self.bank = {
//     //     error: [],
//     //     action: [],
//     //     performance: [],
//     //     environment: {}
//     //   }
//     // })
//   }
//   getAction () {
//     let bank = this.bank
//     const proxyEvent = new ProxyEvent({ node: [document, window] })
//     proxyEvent.onBeforeGuard = function (ev) {
//       var obj = {
//         type: ev.type,
//         src: ev.target.src,
//         xpath: getXpath(ev.target),
//         time: +new Date()
//       }
//       bank.action.push(obj)
//     }
//   }
//   getEnvir () {
//     let bank = this.bank
//     window.addEventListener('load', function (e) {
//       bank.environment = Pformance.perInfo
//       bank.performance = [...bank.performance, ...Pformance.getEnt]
//     })
//   }
//   addError () {
//     let bank = this.bank
//     window.addEventListener('error', function (message, url, line, column, error) {
//       let obj = null
//       if (message.toString() === '[object Event]') {
//         obj = {
//           message: '404',
//           url: url || message.target.src || message.target.href,
//           line: '',
//           column: '',
//           error: '404',
//           time: +new Date()
//         }
//       } else {
//         obj = {
//           message: message.message,
//           url: url || message.filename || location.href,
//           line: line || message.lineno,
//           column: column || message.colno,
//           error: error || (message.error && message.error.stack.toString()),
//           time: +new Date()
//         }
//       }
//       bank.error.push(obj)
//     }, true)
//   }
// }
export default Eye
