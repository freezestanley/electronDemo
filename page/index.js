// import axios from 'axios'
import Wsocket, {throttle, debounce} from './socket'
import * as plant from './plant'
import {readXPath, selectNodes} from './xpath'
import * as eventType from './enum'
import domObserver from './observer'
import Finger from './finger'
import cookie from './cookie'
import AjaxHook, { CreateXMLHttp } from './xmlhttprequest'
import ProxyEvent from './proxyEvent'
import Checkhover from './checkhover'

const wspath = process.env.NODE_ENV === 'production' ? 'wss://isee-test.zhongan.io/sapi/ed/events' : 'ws://127.0.0.1:3000/test/123'
const delay = 300
const proxyEvent = new ProxyEvent()
proxyEvent.callback = function (ev) {
  console.log(`===${ev.type}===${ev.target}`)
}

/**
 *
 *
 * @export
 * @class camera
 */
export default class camera {
  constructor (ws = wspath) {
    this.wsSocket = new Wsocket(ws)
    this.scrollList = []
    this.canvasList = []
    this.hasListener = []
    this.mousedownPoint = null
  }
  static selectNode (xpath) {
    return selectNodes(xpath)
  } 
  static getXpath (node) {
    return readXPath(node)
  }
  
  observer (obj) {
    let evt = obj.evt,
    param = {
      "t": +new Date(),
      "i": cookie.getCookie('ISEE_BIZ'),
      "a": plant.IsPc() ? eventType.AGENT_PC : eventType.AGENT_MOBILE,
      "u": window.location.href
    }

    let event = null
    param.r = `${+new Date()}${eventType.SPLIT_DATA}`
    switch(obj.type) {
      case 'openpage':
        param.wh = `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`
        this.pushData(param)
        break;
      case 'click':
        let point=''
        if (evt instanceof TouchEvent) {
          point = `${eventType.SPLIT_DATA}${evt.changedTouches[0].screenX}-${evt.changedTouches[0].screenY}${eventType.SPLIT_DATA}`
        } else if (evt instanceof MouseEvent){
          point = `${eventType.SPLIT_DATA}${evt.screenX}-${evt.screenY}${eventType.SPLIT_DATA}`
        }
        const link = plant.FindANode(evt.target, 'a')
        if (link && link.target === '_blank') {
          param.r = `${param.r}${eventType.ACTION_TAB}${eventType.SPLIT_DATA}${readXPath(evt.target)}${point}${eventType.SPLIT_LINE}`
        } else {
          param.r = `${param.r}${eventType.ACTION_CLICK}${eventType.SPLIT_DATA}${readXPath(evt.target)}${point}${eventType.SPLIT_LINE}`
        }
        this.pushData(param)
      break;
      case 'mouseover':
        let tagName = evt.target.tagName.toLowerCase()
        let check = Checkhover(evt.target, ':hover')
        if (tagName === 'li' || tagName === 'a' || check || evt.target.onmouseover || (evt.__eventOrginList && evt.__eventOrginList.length > 0)) {
          event = eventType.ACTION_HOVER
          param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
          this.pushData(param, 100)
        }
      break;
      case 'unload':
        // param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
        this.wsSocket.close()
      break;
      case 'inputChange':
        event = eventType.ACTION_INPUT
        if (evt.target.type ===  'password') {
          let length = evt.target.value.length
          evt.target.value = ''
          for (var i = 0; i<length;i++){
            evt.target.value += '*'
          }
        }
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        this.pushData(param, 100)
      break;
      case 'select':
        event = eventType.ACTION_SELECT
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        this.pushData(param)
      break;
      case 'mousedown':
          console.log('mousedown')
        // console.log(evt)
        // param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
        // console.log('mousedown: ' + JSON.stringify(param))
      break;
      case 'mousemove':
        console.log('mousemove')
      break;
      case 'scroll':
        event = eventType.ACTION_SCROLL
        let scroll,target = evt.target
        if (evt.target.nodeName.toLowerCase() === '#document' || evt.target.nodeName.toLowerCase() === 'body' || evt.target.nodeName.toLowerCase() === 'html') {
          scroll = document.documentElement.scrollTop || document.body.scrollTop
          target = document.body
        } else {
          scroll = evt.target.scrollTop
        }
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(target)}${eventType.SPLIT_DATA}${scroll}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        this.pushData(param, 100)
      break;
      case 'visibilitychange':
        event = eventType.ACTION_SWITCH
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${location.href}${eventType.SPLIT_LINE}`
        this.pushData(param)
      break;
      case 'fingermove':
      break;
      case 'visibilityblur':
      break;
      case 'touchdrag':
        event = eventType.ACTION_DRAG
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}S:${evt.changedTouches[0].screenX}-${evt.changedTouches[0].screenY}${eventType.SPLIT_DATA}E:${evt._startPoint.changedTouches[0].screenX}-${evt._startPoint.changedTouches[0].screenY}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        this.pushData(param, 10)
      break;
      case 'paint':
        event = eventType.PAINT_START
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}S:${evt.changedTouches[0].screenX}-${evt.changedTouches[0].screenY}${eventType.SPLIT_DATA}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        this.wsSocket.send(JSON.stringify(param, 10))
      break;
      case 'popstate':
        event = eventType.POP_STATE
        param.r = `${param.r}${event}${eventType.SPLIT_LINE}`
        this.wsSocket.send(JSON.stringify(param))
      break;
      case 'hashchange':
        event = eventType.HASH_CHANGE
        param.r = `${param.r}${event}${eventType.SPLIT_LINE}`
        this.wsSocket.send(JSON.stringify(param))
      break;
      case 'inputBlur':
        event = eventType.INPUT_BLUR
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        this.pushData(param)
      break;
      case 'inputFocus':
        event = eventType.INPUT_FOCUS
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        this.pushData(param)
      break;
    }
    // console.log(obj.type + ': ' + JSON.stringify(param))
  }
  pushData (obj, time = 0) {
    if (time) {
      debounce(() => {
        this.wsSocket.send(JSON.stringify(obj))
      }, time)()
    } else {
      this.wsSocket.send(JSON.stringify(obj))
    }
    
    // debClass.debounce(() => {
    //   this.wsSocket.send(JSON.stringify(obj))
    // }, time)()
  }
  // input textarea select 添加onchange 监听
  inputChangEvent (ev) {
    this.observer({type:'inputChange', evt: ev})
  }
  // select 添加onchange 监听
  selectChangEvent (ev) {
    this.observer({type:'select', evt: ev})
  }
  // blur
  inputBlurEvent (ev) {
    this.observer({type:'inputBlur', evt: ev})
  }
  // select 添加onchange 监听
  inputFocusEvent (ev) {
    this.observer({type:'inputFocus', evt: ev})
  }
  /**
   * 添加dom变化监听 对动态插入的input textarea select 添加监听
   */
  addDomObserver () {
    let config = { 
      attributes: true, 
      childList: true, 
      // characterData: true, 
      subtree: true, 
      attributeOldValue: true, 
      characterDataOldValue: true 
    }
    let mutationEventCallback = (ele, itself) => {
      const _this = this
      // hasListener.map((ele) => {
      //   ele.removeEventListener('change', _this.inputChangEvent.bind(_this))
      // })
 
      const currentNode = [
        ...document.querySelectorAll('input[type=text]'),
        ...document.querySelectorAll('textarea'),
        ...document.querySelectorAll('select'),
        ...document.querySelectorAll('input[type=tel]'),
        ...document.querySelectorAll('input[type=password]'),
        ...document.querySelectorAll('input[type=email]')
      ]
      currentNode.map((ele, index, array) => {
        let hadEvent = this.hasListener.find((e, i, a) => {
          return e === ele
        })
        if (!hadEvent) {
          if (ele.type === 'select') {
            ele.addEventListener('change', _this.selectChangEvent.bind(_this))
          } else if (ele.type === 'text' || ele.type === 'tel' || ele.type === 'password' || ele.type === 'email' || ele.type === 'textarea') {
            ele.addEventListener('input', _this.inputChangEvent.bind(_this))
            ele.addEventListener('blur', _this.inputBlurEvent.bind(_this))
            ele.addEventListener('focus', _this.inputFocusEvent.bind(_this))
          } else {
            ele.addEventListener('change', _this.inputChangEvent.bind(_this))
          }
          this.hasListener.push(ele)
        }
      })
    }
    this.domObserver = new domObserver(document.body, config, mutationEventCallback)
    this.domObserver.start()
  }
  /**
   * 全局代理事件
   */
  eventAgent () {
    /** 
     * dom element scroll evnent 
     * mouseenter mouserleave 模拟div 内部滚动
     * */
    document.body.addEventListener('mouseover', debounce((ev) => {
      this.observer({type:'mouseover', evt: ev})

      const scrolltarget = plant.FindScrollNode(ev.target)

      if (scrolltarget) {
        const targetXpath = readXPath(scrolltarget)
        const isListener = this.scrollList.find(ele => {
          return ele === targetXpath
        })
        if (!isListener) {
          this.scrollList.push(targetXpath)
          const domScroll = debounce((ev) => {
            this.observer({type:'scroll', evt: ev})
                }, delay)

          scrolltarget.addEventListener('mouseenter', () => {
            scrolltarget.addEventListener('scroll', domScroll)
          })

          scrolltarget.addEventListener('mouseleave ', () => {
            scrolltarget.removeEventListener('scroll', domScroll)
          })
        }
      }
    }, delay))

    document.body.addEventListener('click', (ev) => {
      // this.observer({type:'click', evt: ev})
    })

    document.body.addEventListener('mousedown', (ev) => {
      // this.observer({type:'click', evt: ev})
      this.mousedownPoint = ev
    })
    document.body.addEventListener('mouseup', (ev) => {
      // this.observer({type:'click', evt: ev})
      if (this.mousedownPoint.clientX === ev.clientX && this.mousedownPoint.clientY === ev.clientY) {
        this.observer({type:'click', evt: ev})
      } else {
        this.observer({type:'mousemove', evt: ev})
      }
    })
  }

  addFinger () {
    let windowFinger = new Finger(window)
    windowFinger.addEventListener('touchtap', (ev) => {
      this.observer({type:'click', evt: ev})
    })
    window.addEventListener('touchstart', (ev) => {
      if (ev.target.tagName.toLowerCase() === 'canvas') {
        let ele = ev.target
        const targetXpath = readXPath(ele)
        const isListener = this.canvasList.find(ele => {
          return ele === targetXpath
        })
        if (!isListener) {
          ele.addEventListener('touchmove', (ev) => {
            this.observer({type:'paint', evt: ev})
          }, delay)
          this.canvasList.push(targetXpath)
        }
      }
    })
    windowFinger.addEventListener('touchstart', debounce((ev) => {
      const scrolltarget = plant.FindScrollNode(ev.target)
      if (scrolltarget) {
        const targetXpath = readXPath(scrolltarget)
        const isListener = this.scrollList.find(ele => {
          return ele === targetXpath
        })
        if (!isListener) {
          this.scrollList.push(targetXpath)
          const domScroll = debounce((ev) => {
            this.observer({type:'scroll', evt: ev})
                }, delay)

          scrolltarget.addEventListener('touchstart', () => {
            scrolltarget.addEventListener('scroll', domScroll)
          })

          scrolltarget.addEventListener('touchend ', () => {
            scrolltarget.removeEventListener('scroll', domScroll)
          })
        }
      }
    }, delay))
    windowFinger.addEventListener('touchmove', debounce((ev) => {
      // console.log(this)
      this.observer({type:'fingermove', evt: ev})
    }, delay))
    windowFinger.addEventListener('touchdrag', debounce((ev) => {
      this.observer({type:'touchdrag', evt: ev})
    }, delay))
  }
  lazy () {
    var xhr = new CreateXMLHttp();
      xhr.open('GET', `https://static.zhongan.com/upload/mobile/material/1480043510064.png'/?v=${Math.random()}`, false); 
      xhr.send(null);
  }
  addBaseEvent() {
    /** 
     * tab switch
     * */
    document.addEventListener('visibilitychange', (ev) => {

      if (typeof document.hidden === 'boolean' && document.hidden === false) {
        this.observer({type:'visibilitychange', evt: ev})
      } else {
        this.observer({type:'visibilityblur', evt: ev})
      }
    
    })
    window.addEventListener('popstate', (ev) => {
      this.observer({type:'popstate', evt: ev})
    })
    window.addEventListener('hashchange',(ev) => {
      this.observer({type:'hashchange', evt: ev})
    });
    /** 
     * 退出
     * */
    window.addEventListener('beforeunload', (ev) => {
      this.lazy()
      this.observer({type:'unload', evt: ev})
    })
    /** 
     * 页面滚动
     * */
    window.addEventListener('scroll', debounce((ev) => this.observer({type:'scroll', evt: ev}), delay))
  }

  


  /**
   * init 初始化
   */
  init () {
    this.addBaseEvent()
    this.addDomObserver()
    // this.proxyAddEventListener(function (event) {
    //   // event.preventDefault()
    //   console.log('=============proxyAddEventListener=================')
    // })
    plant.IsPc() ?  this.eventAgent() : this.addFinger()
    // this.eventAgent()
    // this.AjaxListener()
  }
}


document.addEventListener("DOMContentLoaded", function(event) {
  /**
 * 自执行 
 * */
(function () {
  var iseebiz = cookie.getCookie('ISEE_BIZ')
  var ISEE_RE = cookie.getCookie('ISEE_RE')
  
  if(process.env.NODE_ENV === 'production') {
    if (ISEE_RE) return
    if (iseebiz) {
      const wcamera = window.wcamera = new camera()
      wcamera.wsSocket.onopen = function (evt) {
        console.log("Connection start.")
        wcamera.observer({type:'openpage', evt: evt})
        
        if (window.st_conf.end && window.st_conf.type) {
          if (window.st_conf.type === 'history') {
            if (location.pathname.indexOf(window.st_conf.end) === 0) {
              cookie.delCookie('ISEE_BIZ')
            }
          } else {
            if (location.hash === window.st_conf.end) {
              cookie.delCookie('ISEE_BIZ')
            }
          }
        }
      }
      wcamera.wsSocket.onmessage = function (evt) {
        // console.log("server:" + evt.data)
      }
      wcamera.wsSocket.onclose = function (evt) {
        console.log("Connection closed.")
      }
      wcamera.wsSocket.onerror = function (evt) {
        console.log(evt)
      }
      wcamera.init()
    }
  } else {
    const wcamera = window.wcamera = new camera()
      wcamera.wsSocket.onopen = function (evt) {
        console.log("Connection start.")
        wcamera.observer({type:'openpage', evt: evt})
        
        if (window.st_conf.end && window.st_conf.type) {
          if (window.st_conf.type === 'history') {
            if (location.pathname.indexOf(window.st_conf.end) === 0) {
              cookie.delCookie('ISEE_BIZ')
            }
          } else {
            if (location.hash === window.st_conf.end) {
              cookie.delCookie('ISEE_BIZ')
            }
          }
        }
      }
      wcamera.wsSocket.onmessage = function (evt) {
        // console.log("server:" + evt.data)
      }
      wcamera.wsSocket.onclose = function (evt) {
        console.log("Connection closed.")
      }
      wcamera.wsSocket.onerror = function (evt) {
        console.log(evt)
      }
      wcamera.init()
  }
  })()
})



// window.addEventListener('beforeunload', function(evt){
//   debugger
//   var request = new XMLHttpRequest();
//   request.open('GET', 'http://www.mozilla.org/', false); 
//   request.timeout = 3000
//   request.send(null);
//   if (request.status === 200) {
//     console.log(request.responseText);
//   }
// })

// function getEvent (){
//   debugger
//   window.addListenerEvent = window.addEventListener
//   Object.defineProperty(window, 'addEventListener', {
//     get : function(...arg){
//       debugger
//       return function (...args) {
//         debugger
//         window.addListenerEvent(args[0], args[1])
//       }
//     },
//     set : function(newValue){
//       debugger
//     }
//   })
// }


// window.addEventListener('click', (e) => {
//   alert('fff')
// })
// getEvent()

// window.addEventListener('click', (e) => {
//   alert('bbb')
// })

// function add (a) {
//   function sum(b) {
//     a = a+b
//     return sum
//   }
//   sum.toString = function () {
//     return a 
//   }
//   return sum
// }