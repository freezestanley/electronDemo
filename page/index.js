// import axios from 'axios'
import Wsocket, {
  throttle,
  debounce
} from "./socket";
import * as plant from "./plant";
import {
  readXPath,
  selectNodes
} from "./xpath";
import * as eventType from "./enum";
import DomObserver from "./observer";
import Finger from "./finger";
import Cookie from "./cookie";
import {
  CreateXMLHttp
} from "./xmlhttprequest";
import ProxyEvent from "./proxyEvent";
import Checkhover from "./checkhover";
import * as utils from "./utils";

/**
 *
 * @config
 * end          结束url
 * type         路由模式      hash  history
 * ws           websocket  url
 * pushMode     推送模式         once      default once
 * domain       cookie 的域     default  .zhongan.com
 * path         cookie path     default  /
 * exp          cookie 过期事件  default 60 * 60 * 1000
 */

let _eId = 1
let ls = JSON.stringify(window.localStorage)

function eId(element) {
  return element._eId || (element._eId = _eId++)
}

const getConfig = function (name) {
  return window.st_conf && window.st_conf[name] ?
    window.st_conf[name] :
    null
}
const cookie = new Cookie(getConfig('domain'), getConfig('path'), getConfig('exp'))

const wspath = getConfig('ws') || (process.env.NODE_ENV === 'production' ?
  'wss://isee-test.zhongan.io/sapi/ed/events' :
  'ws://127.0.0.1:3000/test/123')
const delay = 300
const lazyPath = 'https://www.zhongan.com/open/member/login_screen/get_sso_uni_form_domain_url.jso' +
  'n'
const proxyEvent = new ProxyEvent()
proxyEvent.callback = function (ev) {
  console.log(`===${ev.type}===${ev.target}`)
}
let mousedownPoint

export default class Clairvoyant {
  constructor(ws = wspath) {
    this.wsSocket = new Wsocket(ws)
    this.proxyEvent = proxyEvent
    this.plant = plant.IsPc()
    this.scrollList = []
    this.messageList = []
    this.formlist = []
    this.canvasList = []
    this.transformList = []
  }

  static selectNode(xpath) {
    return selectNodes(xpath)
  }
  static getXpath(node) {
    return readXPath(node)
  }

  shouldScroll(scrollerXpath, variable) {
    const node = selectNodes(scrollerXpath)[0]
    return node && node.scrollHeight && node.scrollHeight >= variable
  }

  init() {
    this.addBaseEvent()
    this.mutationWatch()
    this.plant ?
      this.deskWatch() :
      this.mobileWatch()
  }
  addBaseEvent() {
    // 添加全局基础事件
    document.addEventListener('visibilitychange', ev => {
      typeof document.hidden === 'boolean' && document.hidden === false ?
        this.observer({
          type: 'visibilitychange',
          evt: ev
        }) :
        this.observer({
          type: 'visibilityblur',
          evt: ev
        })
    }, {
      noShadow: true
    })
    window.addEventListener('input', ev => {
      let target = ev
        .target
        .nodeName
        .toLocaleLowerCase()
      if (target === 'textarea') {
        this.observer({
          type: 'inputChange',
          evt: ev
        })
      } else if (target === 'select') {
        this.observer({
          type: 'select',
          evt: ev
        })
      } else if (target === 'input') {
        this.observer({
          type: 'inputChange',
          evt: ev
        })
      }
    }, {
      noShadow: true
    })
    window.addEventListener('popstate', ev => {
      this.observer({
        type: 'popstate',
        evt: ev
      })
    }, {
      noShadow: true
    })

    window.addEventListener('hashchange', ev => {
      this.observer({
        type: 'hashchange',
        evt: ev
      })
    }, {
      noShadow: true
    })

    window.addEventListener('beforeunload', ev => {
      this.observer({
        type: 'unload',
        evt: ev
      })
      this.lazy()
    }, {
      noShadow: true
    })

    window.addEventListener('scroll', debounce(ev => this.observer({
      type: 'scroll',
      evt: ev
    }), delay), {
      noShadow: true
    })
  }

  mutationWatch() {
    let config = {
      attributes: true,
      attributeFilter: ["style"],
      childList: true,
      characterData: false,
      subtree: true,
      attributeOldValue: false,
      characterDataOldValue: false
    }
    let transformList = null
    let mutationEventCallback = (mutationsList, itself) => {
      const _this = this;
      for (let mutation of mutationsList) {
        if (mutation.type == 'attributes') {
          transformList = mutationsList
            .map(mutation => mutation.target)
            .filter(item => item.style.cssText.indexOf('translate') > -1);
          // console.log(mutation, transformList)
          // console.log(mutation.target.getBoundingClientRect())
        }
      }
      _this.transformList = [...new Set(transformList)];
      let currentNode = [
        ...document.querySelectorAll('input'),
        ...document.querySelectorAll('textarea'),
        ...document.querySelectorAll('select')
      ]
      currentNode = currentNode.filter(v => _this.formlist.indexOf(v) === -1)

      currentNode.map((cNode, index, array) => {
        // if (cNode.type === "select") {   // cNode.addEventListener("change",
        // _this.selectChangEvent.bind(_this), {   //   noShadow: true   // }); } else
        // if (   cNode.type === "radio" ||   cNode.type === "checkbox" ) {   //
        // cNode.addEventListener("change", _this.inputChangEvent.bind(_this), {   //
        // noShadow: true   // }); } else
        if (cNode.type != 'radio' || cNode.type != 'checkbox' || cNode.type != 'select') {
          cNode.addEventListener('focus', _this.inputFocusEvent.bind(_this), {
            noShadow: true
          })
          cNode.addEventListener('blur', _this.inputBlurEvent.bind(_this), {
            noShadow: true
          })
        }
      })
      _this.formlist = _this
        .formlist
        .concat(currentNode)
    }

    this.domObserver = new DomObserver(document.body, config, mutationEventCallback)
    this
      .domObserver
      .start()
  }

  inputChangEvent(ev) {
    this.observer({
      type: 'inputChange',
      evt: ev
    })
  }

  inputFocusEvent(ev) {
    this.observer({
      type: 'inputFocus',
      evt: ev
    })
  }
  inputBlurEvent(ev) {
    this.observer({
      type: 'inputBlur',
      evt: ev
    })
  }
  // select 添加onchange 监听
  selectChangEvent(ev) {
    this.observer({
      type: 'select',
      evt: ev
    })
  }

  lazy() {
    var xhr = new CreateXMLHttp()
    xhr.open('GET', `${lazyPath}`, false)
    xhr.send(null)
  }

  deskWatch() {
    // div 内滚动
    document
      .body
      .addEventListener('mouseover', debounce(ev => {
        this.observer({
          type: 'mouseover',
          evt: ev
        })
        const scrollNode = plant.FindScrollNode(ev.target)
        if (scrollNode) {
          // const targetXpath = readXPath(scrollNode);
          const isListener = this
            .scrollList
            .find(ele => {
              return ele === scrollNode
            })
          if (!isListener) {
            this
              .scrollList
              .push(scrollNode)
            const domScroll = debounce(ev => {
              this.observer({
                type: 'scroll',
                evt: ev
              })
            }, delay)

            scrollNode.addEventListener('mouseenter', () => {
              scrollNode.addEventListener('scroll', domScroll, {
                noShadow: true
              })
            }, {
              noShadow: true
            })

            scrollNode.addEventListener('mouseleave ', () => {
              scrollNode.removeEventListener('scroll', domScroll, {
                noShadow: true
              })
            }, {
              noShadow: true
            })
          }
        }
      }, delay), {
        noShadow: true
      })

    // 页面点击
    document
      .body
      .addEventListener('mousedown', ev => {
        mousedownPoint = ev
      }, {
        noShadow: true
      })
    document
      .body
      .addEventListener('mouseup', ev => {
        if (mousedownPoint.clientX === ev.clientX && mousedownPoint.clientY === ev.clientY && mousedownPoint.target === ev.target) {
          this.observer({
            type: 'click',
            evt: ev
          })
        } else {
          this.observer({
            type: 'mousemove',
            evt: ev
          })
        }
      }, {
        noShadow: true
      })
  }

  mobileWatch() {
    let windowFinger = new Finger(window)
    // 页面点击
    windowFinger.addEventListener('touchtap', ev => {
      this.observer({
        type: 'click',
        evt: ev
      })
    })

    // div 内滚动
    windowFinger.addEventListener('touchstart', ev => {
      const scrolltarget = plant.FindScrollNode(ev.target)
      // console.log('-----scrolltarget', scrolltarget)
      if (scrolltarget) {
        // const targetXpath = readXPath(scrolltarget);
        const isListener = this
          .scrollList
          .find(id => {
            return id === eId(scrolltarget)
          })
        if (!isListener) {
          this
            .scrollList
            .push(eId(scrolltarget))
          const domScroll = throttle(ev => {
            this.observer({
              type: 'scroll',
              evt: ev
            })
          }, delay)

          scrolltarget.addEventListener('touchstart', () => {
            scrolltarget.addEventListener('scroll', domScroll)
          })

          scrolltarget.addEventListener('touchend', () => {
            scrolltarget.removeEventListener('scroll', domScroll)
          })
        }
      }
    })

    windowFinger.addEventListener('touchmove', debounce(ev => {
      this.observer({
        type: 'fingermove',
        evt: ev
      })
    }, delay))

    windowFinger.addEventListener("touchdrag", debounce(ev => {
      this
        .transformList
        .forEach(ele => {
          const delta = {
            x: '0',
            y: '0',
            z: '0'
          }
          const mcss = ele.style.cssText

          const transformRect = ele.getBoundingClientRect()
          const dragRect = ev
            .target
            .getBoundingClientRect()
          if (utils.isOverlap(dragRect, transformRect)) {
            const translateArr = mcss
              .match(/(translate(X|Y|3D)?\().*?(?=\))/ig)
              .map(attr => attr.replace('translate', '').toLowerCase())
            translateArr.every((style) => {
              if (style.indexOf('3d(') > -1) {
                const arr = style
                  .replace('3d(', '')
                  .split(',')
                delta.x = arr[0].trim()
                delta.y = arr[1].trim()
                return false
              } else if (style.indexOf('x(') > -1) {
                delta.x = style
                  .replace('x(', '')
                  .trim()
                return true
              } else if (style.indexOf('y(') > -1) {
                delta.y = style
                  .replace('y(', '')
                  .trim()
                return true
              } else {
                const arr = style
                  .replace('(', '')
                  .split(',')
                delta.x = arr[0].trim()
                delta.y = arr[1].trim()
                return false
              }
            })
            // console.log(translateArr); const translateXIndex =
            // mcss.search(/(?<=translateX\()/i) const translateYIndex =
            // mcss.search(/(?<=translateY\()/i) const translateArr =
            // mcss.match(/(?<=translate(X|Y|3D)?\().*?(?=\))/ig) if (translateXIndex !== -1
            // && translateYIndex !== -1) {   if (translateXIndex < translateYIndex) {
            // delta.x = translateArr[0]     delta.y = translateArr[1]   } else { delta.x =
            // translateArr[1]     delta.y = translateArr[0]   } } else if (translateXIndex
            // !== -1) {   delta.x = translateArr[0] } else if (translateYIndex !== -1) {
            // delta.y = translateArr[0] } else {   if (translateArr[0].search(/,/) !== -1)
            // {     const arr = translateArr[0].split(',')     delta.x = arr[0] delta.y =
            // arr[1]   } else if (translateArr[0].trim().search(/\s/) !== -1) {   const arr
            // = translateArr[0].split(' ')     delta.x = arr[0]     delta.y = arr[1] } else
            // {     delta.x = translateArr[0]     delta.y = translateArr[1] } }
            // console.log(ele, translateArr, delta, transformRect)

            this.observer({
              type: "touchdrag",
              evt: ev,
              movement: {
                ele,
                delta,
                rect: transformRect
              }
            });
          }
        })
    }, delay));

    windowFinger.addEventListener('touchpaint', debounce(ev => {
      this.observer({
        type: 'paint',
        evt: ev
      })
    }, delay))
  }

  observer(obj) {
    let evt = obj.evt;
      let movement = obj.movement;
      let param = {
        t: +new Date(),
        i: cookie.getCookie('ISEE_BIZ'),
        a: this.plant ?
          eventType.AGENT_PC : eventType.AGENT_MOBILE,
        u: window.location.href
      };
      let event = null;
      let _self = this
    param.r = `${ + new Date()}${eventType.SPLIT_DATA}`
    const target = {
      openpage: function () {
        // const ck = cookie.getCookie('ISEE_BIZ')
        // const ck_cache = cookie.getCookie('ISEE_BIZ_CACHE')
        // pc端取文档的高度和宽度， 手机端取设备屏幕的宽度和高度
        param.wh = _self.plant ? `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}` : `${window.screen.width}x${window.screen.height}`
        // if (!ck_cache || ck_cache !== ck) {
        //   cookie.setCookie('ISEE_BIZ_CACHE', ck)
        //   param.lc = JSON.stringify(window.localStorage)
        // }
        _self.pushData(param)
      },
      sendLocalstorage: function () {
        param.ls = ls
        _self.pushData(param)
      },
      click: function () {
        let point = ''
        if (evt instanceof TouchEvent) {
          point = `${eventType.SPLIT_DATA}${evt.changedTouches[0].clientX}-${evt.changedTouches[0].clientY}${eventType.SPLIT_DATA}`
        } else if (evt instanceof MouseEvent) {
          point = `${eventType.SPLIT_DATA}${evt.clientX}-${evt.clientY}${eventType.SPLIT_DATA}`
        }
        const link = plant.FindANode(evt.target, 'a')
        if (link && link.target === '_blank') {
          param.r = `${param.r}${eventType.ACTION_TAB}${eventType.SPLIT_DATA}${readXPath(evt.target)}${point}${eventType.SPLIT_LINE}`
        } else {
          param.r = `${param.r}${eventType.ACTION_CLICK}${eventType.SPLIT_DATA}${readXPath(evt.target)}${point}${eventType.SPLIT_LINE}`
        }
        _self.pushData(param)
      },
      mouseover: function () {
        let tagName = evt
          .target
          .tagName
          .toLowerCase()
        let check = Checkhover(evt.target, ':hover')
        if (tagName === 'li' || tagName === 'a' || check || evt.target.onmouseover || (evt.__eventOrginList && evt.__eventOrginList.length > 0)) {
          event = eventType.ACTION_HOVER
          param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_LINE}`
          _self.pushData(param)
        }
      },
      unload: function () {
        _self
          .wsSocket
          .close()
      },
      inputChange: function () {
        event = eventType.ACTION_INPUT
        if (evt.target.type === 'password') {
          let length = evt.target.value.length
          evt.target.value = ''
          for (var i = 0; i < length; i++) {
            evt.target.value += '*'
          }
        }
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        _self.pushData(param)
      },
      select: function () {
        event = eventType.ACTION_SELECT
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        _self.pushData(param)
      },
      mousedown: function () {},
      mousemove: function () {},
      scroll: function () {
        event = eventType.ACTION_SCROLL
        let scroll;
          let target = evt.target
        if (evt.target.nodeName.toLowerCase() === '#document' || evt.target.nodeName.toLowerCase() === 'body' || evt.target.nodeName.toLowerCase() === 'html') {
          scroll = document.documentElement.scrollTop || document.body.scrollTop
          target = document.body
        } else {
          scroll = evt.target.scrollTop
        }
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(target)}${eventType.SPLIT_DATA}${scroll}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        _self.pushData(param)
      },
      visibilitychange: function () {
        event = eventType.ACTION_SWITCH
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${location.href}${eventType.SPLIT_LINE}`
        _self.pushData(param)
      },
      fingermove: function () {},
      visibilityblur: function () {},
      touchdrag: function () {
        event = eventType.ACTION_DRAG;
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}S:${evt.changedTouches[0].clientX}-${evt.changedTouches[0].clientY}${
        eventType.SPLIT_DATA}E:${evt._startPoint.changedTouches[0].clientX}-${evt._startPoint.changedTouches[0].clientY}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        param.m = `${param.m}${event}${eventType.SPLIT_DATA}${readXPath(movement.ele)}${eventType.SPLIT_DATA}W:${movement.rect.width}${
        eventType.SPLIT_DATA}H:${movement.rect.height}${
        eventType.SPLIT_DATA}EX:${movement.delta.x}${
        eventType.SPLIT_DATA}EY:${movement.delta.y}${
        eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        _self.pushData(param, 100);
      },
      paint: function () {
        event = eventType.PAINT_MOVE
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt._movePoint}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        _self
          .wsSocket
          .send(JSON.stringify(param))
      },
      popstate: function () {
        event = eventType.POP_STATE
        param.r = `${param.r}${event}${eventType.SPLIT_LINE}`
        _self
          .wsSocket
          .send(JSON.stringify(param))
      },
      hashchange: function () {
        event = eventType.HASH_CHANGE
        param.r = `${param.r}${event}${eventType.SPLIT_LINE}`
        _self
          .wsSocket
          .send(JSON.stringify(param))
      },
      inputBlur: function () {
        event = eventType.INPUT_BLUR
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        _self.pushData(param)
      },
      inputFocus: function () {
        event = eventType.INPUT_FOCUS
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        _self.pushData(param)
      }
    }
    target[obj.type]()
  }
  pushData(obj, time = 0) {
    if (!cookie.getCookie('ISEE_BIZ'))
      return
    let pushMode = getConfig('pushMode') || 'once'
    if (pushMode === 'once') {
      this
        .wsSocket
        .send(JSON.stringify(obj))
    } else {
      this
        .messageList
        .push(obj)
      if (this.messageList.length >= 30) {
        this
          .wsSocket
          .send(JSON.stringify(this.messageList))
        this.messageList = []
      }
    }
  }
}

document
  .addEventListener('DOMContentLoaded', function (event) {
    var iseebiz = cookie.getCookie('ISEE_BIZ')
    var ISEE_RE = cookie.getCookie('ISEE_RE')
    if (process.env.NODE_ENV === 'production') {
      if (ISEE_RE)
        return
      if (iseebiz) {
        const clairvoyant = (window.clairvoyant = new Clairvoyant())
        clairvoyant.wsSocket.onopen = function (evt) {
          console.log('Connection start.')
          clairvoyant.observer({
            type: 'openpage',
            evt: evt
          })
          let end = getConfig('end')
          let type = getConfig('type')
          if (end && type) {
            if (type === 'history') {
              if (location.pathname.indexOf(end) === 0) {
                cookie.delCookie('ISEE_BIZ')
              }
            } else {
              if (location.hash === end) {
                cookie.delCookie('ISEE_BIZ')
              }
            }
          }
        }
        clairvoyant.wsSocket.onmessage = function (evt) {
          switch (evt.data) {
            // 需要发送localstorage
            case 'LS000':
              clairvoyant.observer({
                type: 'sendLocalstorage'
              })
              break;
            default:
              break;
          }
          // console.log("server:" + evt.data)
        }
        clairvoyant.wsSocket.onclose = function (evt) {
          console.log('Connection closed.')
        }
        clairvoyant.wsSocket.onerror = function (evt) {
          console.log(evt)
        }
        clairvoyant.init()
      }
    } else {
      const clairvoyant = (window.clairvoyant = new Clairvoyant())

      clairvoyant.wsSocket.onopen = function (evt) {
        console.log('Connection start.')
        clairvoyant.observer({
          type: 'openpage',
          evt: evt
        })

        let end = getConfig('end')
        let type = getConfig('type')
        if (end && type) {
          if (type === 'history') {
            if (location.pathname.indexOf(end) === 0) {
              cookie.delCookie('ISEE_BIZ')
            }
          } else {
            if (location.hash === end) {
              cookie.delCookie('ISEE_BIZ')
            }
          }
        }
      }
      clairvoyant.wsSocket.onmessage = function (evt) {
        console.log("server:" + evt.data)
      }
      clairvoyant.wsSocket.onclose = function (evt) {
        console.log('Connection closed.')
      }
      clairvoyant.wsSocket.onerror = function (evt) {
        console.log(evt)
      }
      clairvoyant.init()
    }
  }, {
    noShadow: true
  })