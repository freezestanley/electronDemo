function wsocket (urlValue) {
  if (window.WebSocket) return (new window.WebSocket(urlValue));
  if (window.MozWebSocket) return new MozWebSocket(urlValue);
  return false
}
function Wsocket (url) {
  this.url = url
  this.skt = wsocket(url)
  this.skt.onopen = (ev) => {
    console.log('open')
    this.onopen(ev)
  }
  this.skt.onmessage = this.onmessage
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
    this.skt.send(param)
  } else if (this.skt.readyState === 3) {
    this.reconnect()
  }
}
Wsocket.prototype.close = function () {
  this.skt.close()
}
Wsocket.prototype.reconnect = function () {
  this.skt = wsocket(this.url)
  this.skt.onopen = (ev) => {
    console.log('open')
    this.onopen(ev)
  }
  this.skt.onmessage = this.onmessage
  this.skt.onclose = this.onclose
  this.skt.onerror = this.onerror
}

export default Wsocket = Wsocket

export const debounce = function (method, delay) {
  let timer = null
  return function () {
    debugger
    let context = this, args = arguments
    clearTimeout(timer)
    timer = setTimeout(function(){
      debugger
      method.apply(context,args); 
    }, delay)
  }
}
export const throttle = function (method, delay, time) {
  let timeout, startTime = +new Date()
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