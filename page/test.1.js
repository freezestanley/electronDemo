// import axios from 'axios'
import { ProxyEvent, getXpath } from 'event-shadow' //
import Pformance from './watch/preformance'
import Wsocket from './socket'
import { CreateXMLHttp } from './xmlhttprequest'
import axios from 'axios'
window.Pformance = Pformance
const proxyEvent = new ProxyEvent({ node: [document] })
const bank = window.bank = {
  error: [],
  action: [],
  performance: [],
  environment: {}
}
const lazydomain = {
  development: 'ws://127.0.0.1:3000/test/123'
}
const wspath = lazydomain[process.env.NODE_ENV]
proxyEvent.addAfterGuard = function (ev) {
  var obj = {
    type: ev.type,
    src: ev.target.src,
    xpath: getXpath(ev.target),
    time: +new Date()
  }
  bank.action.push(obj)
}

class Eye {
  constructor (ws = wspath) {
    this.wsSocket = new Wsocket(ws)
  }
}
let temp
var bigEye = new Eye(wspath)
window.onunhandledrejection = function (e) {
  console.log(e.reason)
}
window.addEventListener('load', function (e) {
  // alert('fff')
  bank.environment = Pformance.perInfo
  temp = Pformance.getEnt
  bank.performance = [...bank.performance, ...temp]
  // let p = new Promise(function (resolve, reject) {
  //   setTimeout(function () {
  //     // try {
  //     Object.ff()
  //     console.log('执行完成')
  //     // } catch (e) {
  //     //   console.log(e)
  //     // }
  //     resolve('随便什么数据')
  //   }, 2000)
  // })
  // console.log(p)
  document.getElementById('aa').addEventListener('click', function (e) {
    bigEye.wsSocket.send(JSON.stringify({ a: '1231232' }))
    var xhr = new CreateXMLHttp()
    xhr.open('POST', 'http://jcpt-pmonitor-prophet-za-logserver.test.za.biz/v1/saveWebMonitorLog', false)
    xhr.send({ a: '213123' })
  })
})

window.addEventListener('error', function (message, url, line, column, error) {
  var obj = null
  if (message.toString() === '[object Event]') {
    obj = {
      message: '404',
      url: url || message.target.src || message.target.href,
      line: '',
      column: '',
      error: '404',
      time: +new Date()
    }
  } else {
    obj = {
      message: message.message,
      url: url || message.filename || location.href,
      line: line || message.lineno,
      column: column || message.colno,
      error: error || (message.error && message.error.stack.toString()),
      time: +new Date()
    }
  }
  bank.error.push(obj)
}, true)
