function wsocket(urlValue) {
  if (window.WebSocket) return new window.WebSocket(urlValue)
  if (window.MozWebSocket) return new MozWebSocket(urlValue)
  return false
}
function Wsocket(url) {
  this.url = url
  this.skt = wsocket(url)
  this.skt.onopen = ev => {
    console.log('open')
    this.onopen(ev)
  }
  this.skt.onmessage = this.onmessage
  this.skt.onclose = this.onclose
  this.skt.onerror = this.onerror
}
Wsocket.prototype.onopen = function(evt) {}
Wsocket.prototype.onmessage = function(evt) {}
Wsocket.prototype.onclose = function(evt) {}
Wsocket.prototype.onerror = function(evt) {
  return new Error(evt)
}
Wsocket.prototype.send = function(param) {
  if (this.skt.readyState === 1) {
    this.skt.send(param)
  } else if (this.skt.readyState === 3) {
    this.reconnect()
  }
}
Wsocket.prototype.close = function() {
  this.skt.close()
}
Wsocket.prototype.reconnect = function() {
  this.skt = wsocket(this.url)
  this.skt.onopen = ev => {
    console.log('open')
    this.onopen(ev)
  }
  this.skt.onmessage = this.onmessage
  this.skt.onclose = this.onclose
  this.skt.onerror = this.onerror
}

export default (Wsocket = Wsocket)

export const debounce = function(method, delay) {
  return function() {
    let context = this,
      args = arguments
    if (debounce.timer !== null) {
      clearTimeout(debounce.timer)
      debounce.timer = null
    }
    debounce.timer = setTimeout(function() {
      method.apply(context, args)
      clearTimeout(debounce.timer)
      debounce.timer = null
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

export const throttle = function(method, delay, time) {
  let timeout,
    startTime = +new Date()
  return function() {
    let context = this,
      args = arguments,
      curTime = +new Date()
    clearTimeout(timeout)
    if (curTime - startTime >= time) {
      method.apply(context, args)
      startTime = curTime
    } else {
      timeout = setTimeout(method, delay)
    }
  }
}
