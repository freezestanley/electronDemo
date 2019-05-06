import { ISEE_MSG_POOL, BATCH_COUNT } from '../constant'

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
  this.raf = 0
  this._pool = JSON.parse(localStorage.getItem(ISEE_MSG_POOL) || '[]')
  this.skt.onopen = ev => {
    this.onopen(ev)
    this.doSend()
  }
  this.skt.onmessage = ev => {
    this.onmessage(ev)
    this.onmessageCb(ev)
  }
  this.skt.onclose = this.onclose
  this.skt.onerror = this.onerror
  this.onmessageCb = noop
  this.oncloseCb = noop
  this.onerrorCb = noop
  this.debounceDoSend = debounce(() => this.doSend(), 500, 'debounceDoSend')
  this.debouncePersist = debounce(
    val => {
      // console.log('------------writeToLocal', val)
      localStorage.setItem(ISEE_MSG_POOL, JSON.stringify(val))
    },
    300,
    'debouncePersist'
  )
  Object.defineProperty(this, 'dataPool', {
    enumerable: true,
    configurable: true,
    set: function (val) {
      this._pool = val
      this.debouncePersist(val)
    },
    get: function () {
      return this._pool
    }
  })
}
Wsocket.prototype.onopen = function (evt) {}
Wsocket.prototype.onmessage = function (evt) {
  const { data } = evt
  const resData = (data && data.split(',')) || []
  this.dataPool = this.dataPool.filter(msg => resData.indexOf(`${msg.id}`) === -1)
}
Wsocket.prototype.onclose = function (evt) {
  this.oncloseCb && this.oncloseCb(evt)
}
Wsocket.prototype.onerror = function (evt) {
  this.onerrorCb(evt)
  return new Error(evt)
}
Wsocket.prototype.send = function (param) {
  const paramJson = typeof param === 'string' ? JSON.parse(param) : param
  const target = this.dataPool.find(item => item.id === paramJson.id)
  if (!target) {
    this.dataPool = this.dataPool.concat([paramJson])
  }
  this.debounceDoSend()
}
/**
 * @param {Boolean} isFlush 是否一次性发送localStorage中的所有信息
 */
Wsocket.prototype.doSend = function (isFlush) {
  const msgList = this.dataPool
  if (msgList.length > 0) {
    const dataSlice = isFlush ? msgList : msgList.slice(0, BATCH_COUNT)
    this.skt.send(JSON.stringify(dataSlice))
  }
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
  this.skt.onopen = ev => {}
  this.skt.onmessage = this.onmessage
  this.skt.onclose = this.onclose
  this.skt.onerror = this.onerror
}

export default Wsocket

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
