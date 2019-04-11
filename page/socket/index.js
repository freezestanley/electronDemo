function wsocket (urlValue) {
  if (window.WebSocket) return new window.WebSocket(urlValue)
  // eslint-disable-next-line no-undef
  if (window.MozWebSocket) return new MozWebSocket(urlValue)
  return false
}

// 用来对socket断开后未发送出去的数据加上标记
let __dataId = 0
function identifyData (param) {
  return param.__dataId || (param.__dataId = __dataId++)
}

function Wsocket (url) {
  this.url = url
  this.skt = wsocket(url)
  // 用来存储socket意外断开后页面操作产生的数据
  this.dataPool = []
  // 用来存储socket意外断开后页面操作产生的数据对应的标识id
  this.cachedDataIdList = []
  this.skt.onopen = ev => {
    console.log('open')
    this.onopen(ev)
  }
  this.skt.onmessage = ev => {
    console.log('message')
    this.onmessage(ev)
  }
  this.skt.onclose = this.onclose
  this.skt.onerror = this.onerror
}
Wsocket.prototype.onopen = function (evt) {}
Wsocket.prototype.onmessage = function (evt) {}
Wsocket.prototype.onclose = function (evt) {}
Wsocket.prototype.onerror = function (evt) {
  return new Error(evt)
}
Wsocket.prototype.send = function (param) {
  if (this.skt.readyState === 1) {
    this.skt.send(JSON.stringify(param))
  } else {
    // cached的数据超过了10000个，为避免占用内存太大，清空cache
    if (this.cachedDataIdList.length > 10000) {
      this.cachedDataIdList = []
      this.dataPool = []
    }
    const cachedDataId = identifyData(param)
    if (this.cachedDataIdList.indexOf(cachedDataId) === -1) {
      this.cachedDataIdList.push(cachedDataId)
      this.dataPool.push(param)
    }
    if (this.skt.readyState === 3) {
      this.reconnect(param)
    }
  }
}
Wsocket.prototype.close = function () {
  this.skt.close()
}
Wsocket.prototype.flush = function () {
  while (this.dataPool.length > 0) {
    this.cachedDataIdList.shift()
    const param = this.dataPool.shift()
    this.send(param)
  }
  // 重置标识id
  __dataId = 0
}
Wsocket.prototype.reconnect = function (param) {
  this.skt = wsocket(this.url)
  this.skt.onopen = ev => {
    console.log('reopen')
    // this.skt.send(param)
    this.flush()
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
