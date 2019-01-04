// import axios from 'axios'
import Wsocket, {throttle, debounce} from './socket'
import * as plant from './plant'
import {readXPath, selectNodes} from './xpath'
import * as eventType from './enum'
import domObserver from './observer'
import Finger from './finger'
import cookie from './cookie'
import AjaxHook, { CreateXMLHttp } from './xmlhttprequest'

const wspath = process.env.NODE_ENV === 'production' ? 'wss://isee-test.zhongan.io/sapi/ed/events' : 'ws://127.0.0.1:3000/test/123'
const delay = 300
export default class camera {
  constructor (ws = wspath) {
    this.wsSocket = new Wsocket(ws)
    this.scrollList = []
    this.hasListener = []
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
      "i": cookie.getCookie('iseebiz'),
      "a": plant.IsPc() ? eventType.AGENT_PC : eventType.AGENT_MOBILE,
      "u": window.location.href
    }

    let event = null
    param.r = `${+new Date()}${eventType.SPLIT_DATA}`
    switch(obj.type) {
      case 'openpage':
      // event = eventType.ACTION_OPEN
      // param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
        param.ws = `${document.body.clientWidth}x${document.body.clientHeight}`
        this.pushData(param)
        break;
      case 'click':
        const link = plant.FindANode(evt.target, 'a')
        if (link && link.target === '_blank') {
          param.r = `${param.r}${eventType.ACTION_TAB}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
        } else {
          param.r = `${param.r}${eventType.ACTION_CLICK}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
        }
        this.pushData(param)
      break;
      case 'mouseover':
        let tagName = evt.target.tagName.toLowerCase()
        if (tagName === 'li' || tagName === 'a') {
          event = eventType.ACTION_HOVER
          param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
          this.pushData(param)
        }
      break;
      case 'unload':
        // param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
        this.wsSocket.close()
      break;
      case 'inputChange':
        event = eventType.ACTION_INPUT
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        this.pushData(param)
      break;
      case 'select':
        event = eventType.ACTION_SELECT
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        this.pushData(param)
      break;
      case 'mousedown':
        // console.log(evt)
        // param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
        // console.log('mousedown: ' + JSON.stringify(param))
      break;
      case 'scroll':
      debugger
        event = eventType.ACTION_SCROLL
        let scroll,target = evt.target
        if (evt.target.nodeName.toLowerCase() === '#document' || evt.target.nodeName.toLowerCase() === 'body' || evt.target.nodeName.toLowerCase() === 'html') {
          scroll = document.documentElement.scrollTop || document.body.scrollTop
          target = document.body
        } else {
          scroll = evt.target.scrollTop
        }
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(target)}${eventType.SPLIT_DATA}${scroll}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        this.pushData(param)
      break;
      case 'visibilitychange':
        event = eventType.ACTION_SWITCH
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${location.href}${eventType.SPLIT_LINE}`
        this.pushData(param)
      break;
      case 'fingermove':
      break;
    }
    // console.log(obj.type + ': ' + JSON.stringify(param))
  }
  pushData (obj) {
    this.wsSocket.send(JSON.stringify(obj))
  }
  // input textarea select 添加onchange 监听
  inputChangEvent (ev) {
    this.observer({type:'inputChange', evt: ev})
  }
  // select 添加onchange 监听
  selectChangEvent (ev) {
    this.observer({type:'select', evt: ev})
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
    let mutationEventCallback = (ele) => {
      const _this = this
      // hasListener.map((ele) => {
      //   ele.removeEventListener('change', _this.inputChangEvent.bind(_this))
      // })
 
      const currentNode = [
        ...document.querySelectorAll('input[type=text]'),
        ...document.querySelectorAll('textarea'),
        ...document.querySelectorAll('select')
      ]
      currentNode.map((ele, index, array) => {
        let hadEvent = this.hasListener.find((e, i, a) => {
          return e === ele
        })
        if (!hadEvent) {
          if (ele.type === 'select') {
            ele.addEventListener('change', _this.selectChangEvent.bind(_this))
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
    document.body.addEventListener('click', (ev) => {
      this.observer({type:'click', evt: ev})
    })
    /** 
     * dom element scroll evnent 
     * mouseenter mouserleave 模拟div 内部滚动
     * */
    document.body.addEventListener('mouseover', (ev) => {
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
    }, delay)
    document.body.addEventListener('mousedown', (ev) => this.observer({type:'click', evt: ev}))    
  }

  // AjaxListener () {
  //   AjaxHook()
  //   hookAjax(
  //     {
  //       onreadystatechange: function (xhr) {
  //         console.log("onreadystatechange called: %O", xhr)
  //       },
  //       onload: function (xhr) {
  //         console.log("onload called: %O", xhr)
  //         xhr.responseText = "hook" + xhr.responseText;
  //       },
  //       open: function (arg, xhr) {
  //         console.log("open called: method:%s,url:%s,async:%s", arg[0], arg[1], arg[2], xhr)
  //         arg[1] += "?hook_tag=1";
  //       },
  //       send: function (arg, xhr) {
  //         console.log("send called: %O", arg[0])
  //         xhr.setRequestHeader("_custom_header_", "ajaxhook")
  //       },
  //       setRequestHeader: function (arg, xhr) {
  //         console.log("setRequestHeader called!", arg)
  //       },
  //       timeout: {
  //         setter: function (v, xhr) {
  //           return Math.max(v, 1000);
  //         }
  //       }
  //     }
  //   )
  // }

  addFinger () {
    // debugger
    let windowFinger = new Finger(window)
    windowFinger.addEventListener('touchtap', debounce((ev) => {
      this.observer({type:'click', evt: ev})
    }, delay))
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
  }

  addBaseEvent() {
    /** 
     * tab switch
     * */
    document.addEventListener('visibilitychange', (ev) => {
      if (!document.hide) {
        this.observer({type:'visibilitychange', evt: ev})
      }
    })
    /** 
     * 退出
     * */
    window.addEventListener('beforeunload', (ev) => {
      var xhr = new CreateXMLHttp();
      xhr.open('GET', 'https://www.zhongan.com/', false); 
      xhr.send(null);
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
    plant.IsPc() ?  this.eventAgent() : this.addFinger()
    // this.eventAgent()
    // this.AjaxListener()
  }
}
/**
 * 自执行 
 * */
(function () {
  var iseebiz = cookie.getCookie('iseebiz')
  if (iseebiz) {
    const wcamera = window.wcamera = new camera()
    wcamera.wsSocket.onopen = function (evt) {
      console.log("Connection start.")
      wcamera.observer({type:'openpage', evt: evt})
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