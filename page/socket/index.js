function wsocket (urlValue) {
  if (window.WebSocket) return new window.WebSocket(urlValue)
  // eslint-disable-next-line no-undef
  if (window.MozWebSocket) return new MozWebSocket(urlValue)
  return false
}

export default function Wsocket (url) {
  this.url = url
  this.skt = wsocket(url)
  this.skt.onopen = ev => {
    this.onopen(ev)
  }
  this.skt.onmessage = ev => {
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
  const paramJson = typeof param === 'string' ? JSON.parse(param) : param
  if (this.skt.readyState === 1) {
    this.skt.send(JSON.stringify(paramJson))
  }
}
Wsocket.prototype.close = function () {
  this.skt.close()
}
Wsocket.prototype.reconnect = function (param) {
  this.skt = wsocket(this.url)
  this.skt.onopen = ev => {
    this.reconnectSuccessCb && this.reconnectSuccessCb()
  }
  this.skt.onmessage = this.onmessage
  this.skt.onclose = this.onclose
  this.skt.onerror = this.onerror
}

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
