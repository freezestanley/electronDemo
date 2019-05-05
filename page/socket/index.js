const ISEE_MSG_POOL = 'ISEE_MSG_POOL'
const BATCH_COUNT = 10

function wsocket (urlValue) {
  if (window.WebSocket) return new window.WebSocket(urlValue)
  // eslint-disable-next-line no-undef
  if (window.MozWebSocket) return new MozWebSocket(urlValue)
  return false
}
const noop = function () {}

function Wsocket (url) {
  this.url = url
  this.skt = wsocket(url)
  this.dataPool = JSON.parse(localStorage.getItem(ISEE_MSG_POOL) || '[]')
  this.raf = 0
  this.skt.onopen = ev => {
    // console.log('open')
    this.onopen(ev)
    this.doSend()
  }
  this.skt.onmessage = ev => {
    // console.log('message')
    this.onmessage(ev)
    this.onmessageCb()
  }
  this.skt.onclose = this.onclose
  this.skt.onerror = this.onerror
  this.onmessageCb = noop
  this.oncloseCb = noop
  this.onerrorCb = noop
}
Wsocket.prototype.onopen = function (evt) {}
Wsocket.prototype.onmessage = function (evt) {
  const { data } = evt
  console.log('-----data', data)
  const resData = (data && data.split(',')) || []
  const msgList = JSON.parse(localStorage.getItem(ISEE_MSG_POOL) || '[]')
  resData.forEach(item => {
    const targetIdx = msgList.findIndex(msg => `${msg.id}` === item)
    console.log('----targetIdx', targetIdx)
    if (targetIdx >= 0) {
      msgList.splice(targetIdx, 1)
    }
  })
  localStorage.setItem(ISEE_MSG_POOL, JSON.stringify(msgList))
}
Wsocket.prototype.onclose = function (evt) {
  this.oncloseCb()
}
Wsocket.prototype.onerror = function (evt) {
  this.onerrorCb()
  return new Error(evt)
}
Wsocket.prototype.send = function (param) {
  const paramJson = typeof param === 'string' ? JSON.parse(param) : param
  const target = this.dataPool.find(item => item.id === paramJson.id)
  if (!target) {
    this.dataPool.push(paramJson)
    localStorage.setItem(ISEE_MSG_POOL, JSON.stringify(this.dataPool))
  }
}
Wsocket.prototype.doSend = function () {
  this.raf = setInterval(() => {
    const msgList = JSON.parse(localStorage.getItem(ISEE_MSG_POOL) || '[]')
    if (msgList.length > 0) {
      const dataSlice = msgList.slice(0, BATCH_COUNT)
      this.skt.send(JSON.stringify(dataSlice))
    }
  }, 500)
}
Wsocket.prototype.send = function (param) {
  const paramJson = typeof param === 'string' ? JSON.parse(param) : param
  const target = this.dataPool.find(item => item.id === paramJson.id)
  if (!target) {
    this.dataPool.push(paramJson)
    localStorage.setItem(ISEE_MSG_POOL, JSON.stringify(this.dataPool))
  }
  // if (this.skt.readyState === 1) {
  //   this.skt.send(JSON.stringify(paramJson))
  // } else {
  // }
}
Wsocket.prototype.close = function () {
  this.skt.close()
  if (this.raf) {
    clearInterval(this.raf)
    this.raf = 0
  }
}
Wsocket.prototype.reconnect = function (param) {
  this.skt = wsocket(this.url)
  this.skt.onopen = ev => {
    // console.log('reopen')
    // this.skt.send(param)
  }
  this.skt.onmessage = this.onmessage
  this.skt.onclose = this.onclose
  this.skt.onerror = this.onerror
}

export default Wsocket

// export const debounce = function (method, delay) {
//   let timer = null
//   return function () {
//     let context = this, args = arguments
//     clearTimeout(timer)
//     timer = setTimeout(function(){
//       method.apply(context,args);
//     }, delay)
//   }
// }

export const debounce = function (method, delay, timerName = 'timer') {
  return function () {
    let context = this
    let args = arguments
    if (debounce[timerName] !== null) {
      clearTimeout(debounce[timerName])
      debounce[timerName] = null
    }
    debounce[timerName] = setTimeout(function () {
      method.apply(context, args)
      clearTimeout(debounce[timerName])
      debounce[timerName] = null
    }, delay)
  }
}
debounce.timer = null

// class debounceClass {
//   constructor() {
//     this._time = 100
//   }
//   get time () {
//     return this._time
//   }
//   set time (param) {
//     this._time = param
//   }
//   debounce (method, delay) {
//     let _this = this
//     return function () {
//       let context = this, args = arguments
//       clearTimeout(_this.time)
//       _this.timer = setTimeout(function(){
//         method.apply(context,args);
//       }, delay)
//     }
//   }
// }
// export const debClass = new debounceClass()

export function throttle (fn, threshhold) {
  // 记录上次执行的时间
  var last

  // 定时器
  var timer

  // 默认间隔为 250ms
  threshhold || (threshhold = 250)

  // 返回的函数，每过 threshhold 毫秒就执行一次 fn 函数
  return function () {
    // 保存函数调用时的上下文和参数，传递给 fn
    var context = this
    var args = arguments

    var now = +new Date()

    // 如果距离上次执行 fn 函数的时间小于 threshhold，那么就放弃
    // 执行 fn，并重新计时
    if (last && now < last + threshhold) {
      clearTimeout(timer)

      // 保证在当前时间区间结束后，再执行一次 fn
      timer = setTimeout(function () {
        last = now
        fn.apply(context, args)
      }, threshhold)

      // 在时间区间的最开始和到达指定间隔的时候执行一次 fn
    } else {
      last = now
      fn.apply(context, args)
    }
  }
}
