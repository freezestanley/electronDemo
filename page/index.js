// import axios from 'axios'
import Wsocket, { throttle, debounce } from './socket'
import * as plant from './plant'
import { readXPath, selectNodes } from './xpath'
import * as eventType from './enum'
import DomObserver from './observer'
import Finger from './finger'
import Cookie from './cookie'
import { CreateXMLHttp } from './xmlhttprequest'
import { ProxyEvent } from 'event-shadow'
import Checkhover from './checkhover'
import * as utils from './utils'
import MsgPool from './msgpool'

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
const win = window
const doc = window.document
let ISEE_RE = ''
let ISEE_TEST = ''
// websocket打开之前不发送任何消息，确保wh为第一条消息
let isWsOpened = 'initial'
win.setMask = utils.setMask
win.setWatermark = utils.setWatermark

function eId (element) {
  return element._eId || (element._eId = _eId++)
}
const getConfig = function (name) {
  return win.st_conf && win.st_conf[name] ? win.st_conf[name] : null
}
const cookie = new Cookie(getConfig('domain'), getConfig('path'), getConfig('exp'))

const domain = {
  production: 'wss://isee.zhongan.com/sapi/ed/events',
  uat: 'wss://isee-uat.zhongan.com/sapi/ed/events',
  test: 'wss://isee-test.zhongan.com/sapi/ed/events',
  // 'dev': 'wss://isee-test.zhongan.com/sapi/ed/events',
  // 'io': 'wss://isee-uat.zhongan.io/sapi/ed/events',
  development: 'ws://127.0.0.1:3000/test/123'
}

const wspath = getConfig('ws') || domain[process.env.NODE_ENV]
// console.log('----------process.env.NODE_ENV', process.env.NODE_ENV)
// console.log('-------wspath', wspath)
// (process.env.NODE_ENV === 'production'
//   ? 'wss://isee-test.zhongan.io/sapi/ed/events'
//   : 'ws://127.0.0.1:3000/test/123')
const delay = 300

const lazydomain = {
  production: 'wss://isee.zhongan.com/sapi/block',
  uat: 'wss://isee-uat.zhongan.com/sapi/block',
  test: 'wss://isee-test.zhongan.com/sapi/block',
  // 'dev': 'wss://isee-test.zhongan.com/sapi/block',
  // 'io': 'wss://isee.zhongan.io/sapi/block',
  development: 'ws://127.0.0.1:3000/test/123'
}
const lazyPath = lazydomain[process.env.NODE_ENV]

const proxyEvent = new ProxyEvent()
proxyEvent.addAfterGuard = function (ev) {
  // process.env.NODE_ENV != 'production' && console.log(`=${ev.type}===${ev.target}`)
}
let mousedownPoint
const blockCls = getConfig('blockClass') || 'isee-block'

export default class Clairvoyant {
  constructor (ws = wspath) {
    if (!ISEE_RE && !ISEE_TEST) {
      this.wsSocket = new Wsocket(ws)
      const self = this
      this.msgPool = new MsgPool({
        cookie,
        sendCb (val) {
          self.wsSocket.send(val)
        }
      })
    }
    this.proxyEvent = proxyEvent
    this.plant = plant.IsPc()
    this.scrollList = []
    this.messageList = []
    this.formlist = []
    this.canvasList = []
    this.transformList = []
  }

  static selectNode (xpath) {
    return selectNodes(xpath)
  }
  static getXpath (node) {
    return readXPath(node)
  }
  selectNode (xpath) {
    return selectNodes(xpath)
  }
  getXpath (node) {
    return readXPath(node)
  }

  shouldScroll (scrollerXpath, variable) {
    const node = selectNodes(scrollerXpath)[0]
    return node && node.scrollHeight && node.scrollHeight >= variable
  }

  init () {
    this.addBaseEvent()
    this.mutationWatch()
    this.plant ? this.deskWatch() : this.mobileWatch()
  }

  addBaseEvent () {
    // 添加全局基础事件
    doc.addEventListener(
      'visibilitychange',
      ev => {
        typeof doc.hidden === 'boolean' && doc.hidden === false
          ? this.observer({
            type: 'visibilitychange',
            evt: ev
          })
          : this.observer({
            type: 'visibilityblur',
            evt: ev
          })
      },
      {
        noShadow: true
      }
    )
    win.addEventListener(
      'input',
      ev => {
        let target = ev.target.nodeName.toLocaleLowerCase()
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
      },
      {
        noShadow: true
      }
    )
    win.addEventListener(
      'popstate',
      ev => {
        this.observer({
          type: 'popstate',
          evt: ev
        })
      },
      {
        noShadow: true
      }
    )

    win.addEventListener(
      'hashchange',
      ev => {
        this.observer({
          type: 'hashchange',
          evt: ev
        })
      },
      {
        noShadow: true
      }
    )

    win.addEventListener(
      'beforeunload',
      ev => {
        // 离开页面不要主动关闭连接
        // this.observer({
        //   type: 'unload',
        //   evt: ev
        // })
        console.log('------unload')
        this.msgPool && this.msgPool.persistSync()
        this.lazy()
      },
      {
        noShadow: true
      }
    )

    win.addEventListener(
      'scroll',
      throttle(
        ev =>
          this.observer({
            type: 'scroll',
            evt: ev
          }),
        delay
      ),
      {
        noShadow: true
      }
    )
    win.addEventListener(
      'wheel',
      debounce(
        ev => {
          // console.log(ev)
          this.observer({
            type: 'scroll',
            evt: ev
          })
        },
        delay,
        'wheelTimer'
      ),
      {
        noShadow: true
      }
    )
  }

  mutationWatch () {
    let config = {
      attributes: true,
      attributeFilter: ['style'],
      childList: true,
      characterData: false,
      subtree: true,
      attributeOldValue: false,
      characterDataOldValue: false
    }
    let transformList = []
    let mutationEventCallback = (mutationsList, itself) => {
      const _this = this
      const childrenList = []
      for (let i = 0; i < doc.body.children.length; i++) {
        childrenList.push(doc.body.children[i].tagName.toLowerCase())
      }
      for (let mutation of mutationsList) {
        if (mutation.type == 'attributes') {
          transformList = mutationsList.map(mutation => mutation.target).filter((target) => {
            const transformStyle = target.style.transform
            return transformStyle && transformStyle.indexOf('translate') > -1
          }) || []
          // transformList = mutationsList.map(mutation => mutation.target).filter(item => item.style.cssText.indexOf('translate') > -1) || []
          // console.log(mutation, mutationsList)
          // console.log(mutation.target.getBoundingClientRect())
        }
      }
      _this.transformList = [...new Set([..._this.transformList, ...transformList])]
      let currentNode = [...doc.querySelectorAll('input'), ...doc.querySelectorAll('textarea'), ...doc.querySelectorAll('select')]
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
      _this.formlist = _this.formlist.concat(currentNode)
    }

    this.domObserver = new DomObserver(doc.body, config, mutationEventCallback)
    this.domObserver.start()
  }

  inputChangEvent (ev) {
    this.observer({
      type: 'inputChange',
      evt: ev
    })
  }

  inputFocusEvent (ev) {
    this.observer({
      type: 'inputFocus',
      evt: ev
    })
  }
  inputBlurEvent (ev) {
    this.observer({
      type: 'inputBlur',
      evt: ev
    })
  }
  // select 添加onchange 监听
  selectChangEvent (ev) {
    this.observer({
      type: 'select',
      evt: ev
    })
  }

  lazy () {
    var xhr = new CreateXMLHttp()
    xhr.open('GET', `${lazyPath}`, false)
    xhr.send(null)
  }

  deskWatch () {
    const debounceObserver = (cb, delay) => {
      debounce(cb, delay, 'clickTimer')()
    }
    let mouseX
    let mouseY
    // div 内滚动
    doc.body.addEventListener(
      'mouseover',
      ev => {
        mouseX = ev.clientX
        mouseY = ev.clientY
        const t = Date.now()
        const xpath = readXPath(ev.target)
        debounce(
          () => {
            this.observer({
              type: 'mouseover',
              evt: ev,
              xpath,
              t
            })
            const scrollNode = plant.FindScrollNode(ev.target)
            if (scrollNode) {
              // const targetXpath = readXPath(scrollNode);
              const isListener = this.scrollList.find(ele => {
                return ele === scrollNode
              })
              if (!isListener) {
                this.scrollList.push(scrollNode)
                const domScroll = throttle(ev => {
                  // console.log('domScroll')
                  this.observer({
                    type: 'scroll',
                    evt: ev
                  })
                }, delay)

                scrollNode.addEventListener('scroll', domScroll, {
                  noShadow: true
                })
                // console.log('scrollNode', scrollNode)

                // scrollNode.addEventListener('mouseenter', () => {
                //   scrollNode.addEventListener('scroll', domScroll, {
                //     noShadow: true
                //   })
                // }, {
                //   noShadow: true
                // })

                // scrollNode.addEventListener('mouseleave ', () => {
                //   scrollNode.removeEventListener('scroll', domScroll, {
                //     noShadow: true
                //   })
                // }, {
                //   noShadow: true
                // })
              }
            }
          },
          delay,
          'mouseoverTimer'
        )()
      },
      {
        noShadow: true
      }
    )

    // 页面点击
    doc.body.addEventListener(
      'mousedown',
      ev => {
        mousedownPoint = ev
      },
      {
        noShadow: true
      }
    )
    doc.body.addEventListener(
      'mouseup',
      ev => {
        const evt = ev
        const xpath = readXPath(ev.target)
        const targetClientRect = ev.target.getBoundingClientRect()
        const clientX = ev.target.clientX || mouseX
        const clientY = ev.target.clientY || mouseY
        const t = Date.now()
        debounceObserver(() => {
          if (mousedownPoint.clientX === ev.clientX && mousedownPoint.clientY === ev.clientY && mousedownPoint.target === ev.target) {
            this.observer({
              type: 'click',
              evt,
              xpath,
              clientX,
              clientY,
              targetClientRect,
              t
            })
          } else {
            this.observer({
              type: 'mousemove',
              evt,
              xpath
            })
          }
        }, 10)
      },
      {
        noShadow: true
      }
    )
    doc.body.addEventListener(
      'click',
      ev => {
        const evt = ev
        const xpath = readXPath(ev.target)
        const targetClientRect = ev.target.getBoundingClientRect()
        const clientX = ev.target.clientX || mouseX
        const clientY = ev.target.clientY || mouseY
        const t = Date.now()
        debounceObserver(() => {
          this.observer({
            type: 'click',
            evt,
            xpath,
            clientX,
            clientY,
            targetClientRect,
            t
          })
        }, 10)
      },
      {
        noShadow: true
      }
    )
  }

  mobileWatch () {
    let windowFinger = new Finger(win)
    // 页面点击
    windowFinger.addEventListener(
      'touchtap',
      ev => {
        const xpath = ev._xpath || null
        this.observer({
          type: 'click',
          evt: ev,
          xpath
        })
      },
      {
        noShadow: true
      }
    )

    // div 内滚动
    windowFinger.addEventListener(
      'touchstart',
      ev => {
        const scrolltarget = plant.FindScrollNode(ev.target)
        // console.log('-----scrolltarget', scrolltarget)
        if (scrolltarget) {
          // const targetXpath = readXPath(scrolltarget);
          const isListener = this.scrollList.find(id => {
            return id === eId(scrolltarget)
          })
          if (!isListener) {
            this.scrollList.push(eId(scrolltarget))
            const domScroll = throttle(ev => {
              this.observer({
                type: 'scroll',
                evt: ev
              })
            }, delay)
            scrolltarget.addEventListener('scroll', domScroll, {
              noShadow: true
            })
            // scrolltarget.addEventListener('touchstart', () => {
            // scrolltarget.addEventListener('scroll', domScroll)
            // })

            // scrolltarget.addEventListener('touchend', () => {
            //   scrolltarget.removeEventListener('scroll', domScroll)
            // })
          }
        }
      },
      {
        noShadow: true
      }
    )

    windowFinger.addEventListener(
      'touchmove',
      debounce(
        ev => {
          this.observer({
            type: 'fingermove',
            evt: ev
          })
        },
        delay,
        'touchmoveTimer'
      ),
      {
        noShadow: true
      }
    )

    windowFinger.addEventListener(
      'touchdrag',
      debounce(
        ev => {
          this.transformList.forEach(ele => {
            const transformRect = ele.getBoundingClientRect()
            const dragRect = ev.target.getBoundingClientRect()
            if (utils.isOverlap(dragRect, transformRect)) {
              // console.log(ele, this.transformList)
              this.observer({
                type: 'touchdrag',
                evt: ev,
                movement: {
                  ele,
                  delta: utils.getDelta(ele.style.transform),
                  rect: transformRect
                }
              })
            }
          })
          this.transformList = []
        },
        delay,
        'touchdragTimer'
      ),
      {
        noShadow: true
      }
    )

    windowFinger.addEventListener(
      'touchpaint',
      ev => {
        this.observer({
          type: 'paint',
          evt: ev
        })
      },
      {
        noShadow: true
      }
    )
  }

  isBlocked (node) {
    if (!node) {
      return false
    }
    if (node.nodeType === node.ELEMENT_NODE && node.classList) {
      return node.classList.contains(blockCls) || this.isBlocked(node.parentNode, blockCls)
    }
    return this.isBlocked(node.parentNode)
  }

  observer (obj) {
    const { evt, movement, xpath, targetClientRect, clientX, clientY, t } = obj
    if (evt && evt.target && this.isBlocked(evt.target)) {
      return
    }
    let param = {
      t: t || +new Date(),
      i: cookie.getCookie('ISEE_BIZ'),
      a: this.plant ? eventType.AGENT_PC : eventType.AGENT_MOBILE,
      u: win.location.href
    }
    let event = null
    let _self = this
    param.r = `${t || +new Date()}${eventType.SPLIT_DATA}`
    const target = {
      openpage: function () {
        param.wh = _self.plant ? `${doc.documentElement.clientWidth}x${doc.documentElement.clientHeight}` : `${win.screen.width}x${win.screen.height}`
        _self.pushData(param)
      },
      sendLocalstorage: function () {
        param.ls = ls
        _self.pushData(param)
      },
      click: function () {
        let point = ''
        let xPosition = ''
        let yPosition = ''
        if (evt instanceof TouchEvent) {
          xPosition = (clientX || evt.changedTouches[0].clientX) - (targetClientRect ? targetClientRect.left : evt.changedTouches[0].target.getBoundingClientRect().left)
          yPosition = (clientY || evt.changedTouches[0].clientY) - (targetClientRect ? targetClientRect.top : evt.changedTouches[0].target.getBoundingClientRect().top)
        } else if (evt instanceof MouseEvent) {
          xPosition = (clientX || evt.clientX) - (targetClientRect ? targetClientRect.left : evt.target.getBoundingClientRect().left)
          yPosition = (clientY || evt.clientY) - (targetClientRect ? targetClientRect.top : evt.target.getBoundingClientRect().top)
        }
        point = `${eventType.SPLIT_DATA}${xPosition}-${yPosition}${eventType.SPLIT_DATA}`
        const link = plant.FindANode(evt.target, 'a')
        if (link && link.target === '_blank') {
          param.r = `${param.r}${eventType.ACTION_TAB}${eventType.SPLIT_DATA}${xpath || readXPath(evt.target)}${point}${eventType.SPLIT_LINE}`
        } else {
          param.r = `${param.r}${eventType.ACTION_CLICK}${eventType.SPLIT_DATA}${xpath || readXPath(evt.target)}${point}${eventType.SPLIT_LINE}`
        }
        _self.pushData(param, eventType.ACTION_CLICK)
      },
      mouseover: function () {
        let tagName = evt.target.tagName.toLowerCase()
        let check = Checkhover(evt.target, ':hover')
        if (tagName === 'li' || tagName === 'a' || check || evt.target.onmouseover || (evt.target.__proxy && evt.target.__proxy.__eventOrginList && evt.target.__proxy.__eventOrginList.length > 0)) {
          event = eventType.ACTION_HOVER
          param.r = `${param.r}${event}${eventType.SPLIT_DATA}${xpath || readXPath(evt.target)}${eventType.SPLIT_LINE}`
          _self.pushData(param, event)
        }
      },
      unload: function () {
        _self.wsSocket.close()
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
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${xpath || readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        _self.pushData(param, event)
      },
      select: function () {
        event = eventType.ACTION_SELECT
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${xpath || readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        _self.pushData(param, event)
      },
      mousedown: function () {},
      mousemove: function () {},
      scroll: function () {
        event = eventType.ACTION_SCROLL
        let scroll
        let target = evt.target
        if (evt.target.nodeName.toLowerCase() === 'body' || evt.target.nodeName.toLowerCase() === 'html' || evt.target.nodeName.toLowerCase() === '#document') {
          scroll = doc.documentElement.scrollTop || doc.body.scrollTop
          target = doc.body
        } else {
          scroll = evt.target.scrollTop
        }
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${xpath || readXPath(target)}${eventType.SPLIT_DATA}${scroll}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`

        _self.pushData(param, event)
      },
      visibilitychange: function () {
        event = eventType.ACTION_SWITCH
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${location.href}${eventType.SPLIT_LINE}`
        _self.pushData(param, event)
      },
      fingermove: function () {},
      visibilityblur: function () {},
      touchdrag: function () {
        event = eventType.ACTION_DRAG
        const r = param.r.concat()
        param.r = `${r}${event}${eventType.SPLIT_DATA}${xpath || readXPath(evt.target)}${eventType.SPLIT_DATA}${movement.rect.width},${movement.rect.height}${eventType.SPLIT_DATA}${
          movement.delta.x
        },${movement.delta.y},${movement.delta.z}${eventType.SPLIT_DATA}${xpath || readXPath(movement.ele)}${eventType.SPLIT_DATA}${evt._startPoint.changedTouches[0].clientX},${
          evt._startPoint.changedTouches[0].clientY
        }${eventType.SPLIT_DATA}${evt.changedTouches[0].clientX},${evt.changedTouches[0].clientY}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        _self.pushData(param, event, 100)
      },
      paint: function () {
        event = eventType.PAINT_MOVE
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${xpath || readXPath(evt.target)}${eventType.SPLIT_DATA}${evt._movePoint}${eventType.SPLIT_DATA}${eventType.SPLIT_LINE}`
        _self.pushData(param, event)
      },
      popstate: function () {
        event = eventType.POP_STATE
        param.r = `${param.r}${event}${eventType.SPLIT_LINE}`
        !ISEE_RE && !ISEE_TEST && _self.pushData(param, event)
      },
      hashchange: function () {
        event = eventType.HASH_CHANGE
        param.r = `${param.r}${event}${eventType.SPLIT_LINE}`
        !ISEE_RE && !ISEE_TEST && _self.pushData(param, event)
      },
      inputBlur: function () {
        event = eventType.INPUT_BLUR
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${xpath || readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        _self.pushData(param, event)
      },
      inputFocus: function () {
        event = eventType.INPUT_FOCUS
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${xpath || readXPath(evt.target)}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`
        _self.pushData(param, event)
      }
    }
    target[obj.type]()
  }
  pushData (obj, eventType, time = 0) {
    if (ISEE_RE || ISEE_TEST) {
      if (eventType) {
        window.sessionStorage.setItem(`iseeAction-${eventType}`, JSON.stringify(obj))
      }
      return
    }
    if (process.env.NODE_ENV === 'production' && !cookie.getCookie('ISEE_BIZ')) {
      return
    }
    let pushMode = getConfig('pushMode') || 'once'
    // 发现超时后重新链接
    if ((this.msgPool && this.msgPool.resndMaxExceed) || isWsOpened === 'close') {
      debounce(
        () => {
          this.wsSocket.reconnect(() => {
            this.msgPool.startTimer()
            this.msgPool.resetResndMaxExceed()
            isWsOpened = 'done'
          })
        },
        300,
        'reconnect'
      )()
    }
    if (isWsOpened === 'initial') {
      return
    }

    if (pushMode === 'once') {
      this.msgPool.addPool(obj)
    } else {
      this.messageList.push(obj)
      if (this.messageList.length >= 30) {
        // this.wsSocket.send(this.messageList)
        this.msgPool.addPool(this.messageList)
        this.messageList = []
      }
    }
  }
}

function domloaded (event) {
  ISEE_RE = cookie.getCookie('ISEE_RE') || ''
  ISEE_TEST = cookie.getCookie('ISEE_TEST') || ''
  const onmessageCb = function (clairvoyant, evt) {
    const data = evt.data
    switch (data) {
      // 需要发送localstorage
      case 'LS000':
        clairvoyant.observer({
          type: 'sendLocalstorage'
        })
        break
      default:
        if (data) {
          const arr = data.split(',')
          clairvoyant.msgPool.removeConfirmPool(arr)
        }
        break
    }
    clairvoyant.msgPool.removePool()
  }
  const onopenCb = function (clairvoyant, evt) {
    // console.log('Connection start.')
    isWsOpened = 'done'
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
  const clairvoyantInit = function (isDev) {
    var iseebiz = cookie.getCookie('ISEE_BIZ')
    const clairvoyant = (win.clairvoyant = new Clairvoyant())
    if (ISEE_RE || ISEE_TEST) {
      clairvoyant.init()
      return
    }
    if (!isDev && !iseebiz) {
      return
    }
    clairvoyant.wsSocket.onopen = function (evt) {
      onopenCb(clairvoyant, evt)
    }
    clairvoyant.wsSocket.onmessage = function (evt) {
      onmessageCb(clairvoyant, evt)
    }
    clairvoyant.wsSocket.onclose = function (evt) {
      // console.log('Connection closed.')
      isWsOpened = 'close'
    }
    clairvoyant.wsSocket.onerror = function (evt) {
      // console.log(evt)
      utils.sendErrorMsg(JSON.stringify(evt))
    }
    clairvoyant.wsSocket.reconnectSuccessCb = function (evt) {
      // 重新连接成功后把resendCount复位
      clairvoyant.msgPool.rendMaxExceed = false
    }
    clairvoyant.init()
  }
  clairvoyantInit(process.env.NODE_ENV === 'development')
}

doc.addEventListener('DOMContentLoaded', domloaded, {
  noShadow: true
})

win.addEventListener(
  'pageshow',
  function (evt) {
    if (evt.persisted) {
      domloaded()
    }
  },
  {
    noShadow: true
  }
)
