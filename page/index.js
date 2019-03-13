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
const lazyPath = 'https://www.zhongan.com/open/member/login_screen/get_sso_uni_form_domain_url.json'
const proxyEvent = new ProxyEvent()
proxyEvent.callback = function (ev) {
  console.log(`===${ev.type}===${ev.target}`)
}
let mousedownPoint
export default class clairvoyant {
  constructor (ws = wspath) {
    // this.wsSocket = new Wsocket(ws)
    this.proxyEvent = proxyEvent
    this.plant = plant.IsPc()
    this.scrollList = []
  }

  static selectNode (xpath) {
    return selectNodes(xpath)
  } 
  static getXpath (node) {
    return readXPath(node)
  }

  init () {
    this.addBaseEvent() 
    this.mutationWatch()
    this.plant ? this.deskWatch() : this.mobileWatch()
  }
  addBaseEvent () { // 添加全局基础事件 
    document.addEventListener('visibilitychange', (ev) => {
      (typeof document.hidden) === 'boolean' && document.hidden === false ?
        this.observer({type:'visibilitychange', evt: ev}) :
        this.observer({type:'visibilityblur', evt: ev})
    }, {noShadow: true})

    window.addEventListener('popstate', (ev) => {
      this.observer({type:'popstate', evt: ev})
    }, {noShadow: true})

    window.addEventListener('hashchange',(ev) => {
      this.observer({type:'hashchange', evt: ev})
    }, {noShadow: true})

    window.addEventListener('beforeunload', (ev) => {
      this.observer({type:'unload', evt: ev})
      this.lazy()
    }, {noShadow: true})

    window.addEventListener('scroll', debounce((ev) => 
      this.observer({type:'scroll', evt: ev})), 
    {noShadow: true})
  }
  
  mutationWatch () {
    let config = { 
      attributes: false, 
      childList: true, 
      characterData: false, 
      subtree: true, 
      attributeOldValue: false, 
      characterDataOldValue: false 
    }
    let mutationEventCallback = (ele, itself) => {
      const _this = this
      let currentNode = []
      ele.map((e, idx, arr) => {
        if (e.type === 'childList') {
          for (let i = 0; i < e.addedNodes.length; i++) {
            let ne = e.addedNodes[i]
            let netagname = ne.tagName.toLocaleLowerCase()
            if (netagname === 'input' || netagname === 'select' || netagname === 'textarea') {
              currentNode.push(ne)
            }
            let query = [
              ...ne.querySelectorAll('input[type=text]'),
              ...ne.querySelectorAll('textarea'),
              ...ne.querySelectorAll('select'),
              ...ne.querySelectorAll('input[type=tel]'),
              ...ne.querySelectorAll('input[type=password]'),
              ...ne.querySelectorAll('input[type=email]'),
              ...ne.querySelectorAll('input[type=radio]'),
              ...ne.querySelectorAll('input[type=checkbox]'),
              ...ne.querySelectorAll('input[type=number]')
            ]
            currentNode = currentNode.concat(query)
          }
        }
      })

      currentNode.map((cNode, index, array) => {
        if (cNode.type === 'select') {
          cNode.addEventListener('change', _this.selectChangEvent.bind(_this), {noShadow: true})
        } else if (cNode.type === 'text' || cNode.type === 'tel' || cNode.type === 'password' || cNode.type === 'email' || cNode.type === 'textarea' || cNode.type === 'number') {
          cNode.addEventListener('input', _this.inputChangEvent.bind(_this), {noShadow: true})
        } else {
          cNode.addEventListener('change', _this.inputChangEvent.bind(_this), {noShadow: true})
        }
      })

    }
    this.domObserver = new domObserver(document.body, config, mutationEventCallback)
    this.domObserver.start()
  }
  inputChangEvent (ev) {
    this.observer({type:'inputChange', evt: ev})
  }
  // select 添加onchange 监听
  selectChangEvent (ev) {
    this.observer({type:'select', evt: ev})
  }

  lazy () {
    var xhr = new CreateXMLHttp();
    xhr.open('GET', `${lazyPath}`, false); 
    xhr.send(null);
  }

  deskWatch () {
    // div 内滚动
    document.body.addEventListener('mouseover', debounce((ev) => {
      this.observer({type: 'mouseover', evt: ev})
      const scrollNode = plant.FindScrollNode(ev.target)
      if (scrollNode) {
        const targetXpath = readXPath(scrollNode)
        const isListener = this.scrollList.find(ele => {
          return ele === targetXpath
        })
        if (!isListener) {
          this.scrollList.push(targetXpath)
          const domScroll = debounce((ev) => {
            this.observer({type:'scroll', evt: ev})
                }, delay)

          scrolltarget.addEventListener('mouseenter', () => {
            scrolltarget.addEventListener('scroll', domScroll, {noShadow: true})
          }, {noShadow: true})

          scrolltarget.addEventListener('mouseleave ', () => {
            scrolltarget.removeEventListener('scroll', domScroll, {noShadow: true})
          }, {noShadow: true})
        }
      }
    }), {noShadow: true})

    // 页面点击
    document.body.addEventListener('mousedown', (ev) => {
      mousedownPoint = ev
    }, {noShadow: true})
    document.body.addEventListener('mouseup', (ev) => {
      if (mousedownPoint.clientX === ev.clientX && mousedownPoint.clientY === ev.clientY) {
        this.observer({type:'click', evt: ev})
      } else {
        this.observer({type:'mousemove', evt: ev})
      }
    }, {noShadow: true})


  }

  mobileWatch () {
    let windowFinger = new Finger(window)
    // 页面点击
    windowFinger.addEventListener('touchtap', (ev) => {
      this.observer({type:'click', evt: ev})
    })

    // canvas 画图
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

    // div 内滚动
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

    //
    windowFinger.addEventListener('touchmove', debounce((ev) => {
      this.observer({type:'fingermove', evt: ev})
    }, delay))

    //
    windowFinger.addEventListener('touchdrag', debounce((ev) => {
      this.observer({type:'touchdrag', evt: ev})
    }, delay))
  }

  observer (obj) {
    console.log(obj.type)
    console.log(obj.evt)
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  const Clairvoyant = new clairvoyant()
  Clairvoyant.init()
}, {noShadow: true})
