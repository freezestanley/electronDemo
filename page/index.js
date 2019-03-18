// import axios from 'axios'
import Wsocket, { throttle, debounce } from "./socket";
import * as plant from "./plant";
import { readXPath, selectNodes } from "./xpath";
import * as eventType from "./enum";
import domObserver from "./observer";
import Finger from "./finger";
import Cookie from "./cookie";
import AjaxHook, { CreateXMLHttp } from "./xmlhttprequest";
import ProxyEvent from "./proxyEvent";
import Checkhover from "./checkhover";

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

const getConfig = function (name) {
  return (window.st_conf && window.st_conf[name]) ? window.st_conf[name] : null
}
const cookie = new Cookie(getConfig('domain'), getConfig('path'), getConfig('exp'))
const wspath = (getConfig('ws')) || (
  process.env.NODE_ENV === "production"
    ? "wss://isee-test.zhongan.io/sapi/ed/events"
    : "ws://127.0.0.1:3000/test/123");
const delay = 300;
const lazyPath =
  "https://www.zhongan.com/open/member/login_screen/get_sso_uni_form_domain_url.json";
const proxyEvent = new ProxyEvent();
proxyEvent.callback = function(ev) {
  console.log(`===${ev.type}===${ev.target}`);
};
let mousedownPoint;

export default class clairvoyant {
  constructor(ws = wspath) {
    this.wsSocket = new Wsocket(ws)
    this.proxyEvent = proxyEvent;
    this.plant = plant.IsPc();
    this.scrollList = [];
    this.messageList = []
  }

  static selectNode(xpath) {
    return selectNodes(xpath);
  }
  static getXpath(node) {
    return readXPath(node);
  }

  init() {
    this.addBaseEvent();
    this.mutationWatch();
    this.plant ? this.deskWatch() : this.mobileWatch();
  }
  addBaseEvent() {
    // 添加全局基础事件
    document.addEventListener(
      "visibilitychange",
      ev => {
        typeof document.hidden === "boolean" && document.hidden === false
          ? this.observer({ type: "visibilitychange", evt: ev })
          : this.observer({ type: "visibilityblur", evt: ev });
      },
      { noShadow: true }
    );

    window.addEventListener(
      "popstate",
      ev => {
        this.observer({ type: "popstate", evt: ev });
      },
      { noShadow: true }
    );

    window.addEventListener(
      "hashchange",
      ev => {
        this.observer({ type: "hashchange", evt: ev });
      },
      { noShadow: true }
    );

    window.addEventListener(
      "beforeunload",
      ev => {
        this.observer({ type: "unload", evt: ev });
        this.lazy();
      },
      { noShadow: true }
    );

    window.addEventListener(
      "scroll",
      debounce(ev => this.observer({ type: "scroll", evt: ev }), delay),
      { noShadow: true }
    );
  }

  mutationWatch() {
    let config = {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true,
      attributeOldValue: false,
      characterDataOldValue: false
    };
    let mutationEventCallback = (ele, itself) => {
      const _this = this;
      let currentNode = [];
      ele.map((e, idx, arr) => {
        if (e.type === "childList" && e.addedNodes.length > 0) {
          for (let i = 0; i < e.addedNodes.length; i++) {
            let ne = e.addedNodes[i];
            
            if (ne.nodeType != 1) continue 
            let netagname = ne.tagName && ne.tagName.toLocaleLowerCase();
            if (
              netagname === "input" ||
              netagname === "select" ||
              netagname === "textarea"
            ) {
              currentNode.push(ne);
            }
            let query = [
              ...ne.querySelectorAll("input"),
              ...ne.querySelectorAll("textarea"),
              ...ne.querySelectorAll("select")
            ];
            currentNode = currentNode.concat(query);
            if(currentNode.length > 0) {
              console.log(ne.innerHTML)
              console.log(currentNode)
            }
          }
        }
      });

      currentNode.map((cNode, index, array) => {
        if (cNode.type === "select") {
          cNode.addEventListener("change", _this.selectChangEvent.bind(_this), {
            noShadow: true
          });
        } else if (
          cNode.type === "radio" ||
          cNode.type === "checkbox" 
        ) {
          cNode.addEventListener("change", _this.inputChangEvent.bind(_this), {
            noShadow: true
          });
        } else {
          cNode.addEventListener("input", _this.inputChangEvent.bind(_this), {
            noShadow: true
          });
        }
      });
    };
    this.domObserver = new domObserver(
      document.body,
      config,
      mutationEventCallback
    );
    this.domObserver.start();
  }
  inputChangEvent(ev) {
    this.observer({ type: "inputChange", evt: ev });
  }
  // select 添加onchange 监听
  selectChangEvent(ev) {
    this.observer({ type: "select", evt: ev });
  }

  lazy() {
    var xhr = new CreateXMLHttp();
    xhr.open("GET", `${lazyPath}`, false);
    xhr.send(null);
  }

  deskWatch() {
    // div 内滚动
    document.body.addEventListener(
      "mouseover",
      debounce(ev => {
        this.observer({ type: "mouseover", evt: ev });
        const scrollNode = plant.FindScrollNode(ev.target);
        if (scrollNode) {
          const targetXpath = readXPath(scrollNode);
          const isListener = this.scrollList.find(ele => {
            return ele === targetXpath;
          });
          if (!isListener) {
            this.scrollList.push(targetXpath);
            const domScroll = debounce(ev => {
              this.observer({ type: "scroll", evt: ev });
            }, delay);

            scrollNode.addEventListener(
              "mouseenter",
              () => {
                scrollNode.addEventListener("scroll", domScroll, {
                  noShadow: true
                });
              },
              { noShadow: true }
            );

            scrollNode.addEventListener(
              "mouseleave ",
              () => {
                scrollNode.removeEventListener("scroll", domScroll, {
                  noShadow: true
                });
              },
              { noShadow: true }
            );
          }
        }
      }, delay),
      { noShadow: true }
    );

    // 页面点击
    document.body.addEventListener(
      "mousedown",
      ev => {
        mousedownPoint = ev;
      },
      { noShadow: true }
    );
    document.body.addEventListener(
      "mouseup",
      ev => {
        if (
          mousedownPoint.clientX === ev.clientX &&
          mousedownPoint.clientY === ev.clientY
        ) {
          this.observer({ type: "click", evt: ev });
        } else {
          this.observer({ type: "mousemove", evt: ev });
        }
      },
      { noShadow: true }
    );
  }

  mobileWatch() {
    let windowFinger = new Finger(window);
    // 页面点击
    windowFinger.addEventListener("touchtap", ev => {
      this.observer({ type: "click", evt: ev });
    });

    // canvas 画图
    window.addEventListener("touchstart", ev => {
      if (ev.target.tagName.toLowerCase() === "canvas") {
        let ele = ev.target;
        const targetXpath = readXPath(ele);
        const isListener = this.canvasList.find(ele => {
          return ele === targetXpath;
        });
        if (!isListener) {
          ele.addEventListener(
            "touchmove",
            ev => {
              this.observer({ type: "paint", evt: ev });
            },
            delay
          );
          this.canvasList.push(targetXpath);
        }
      }
    });

    // div 内滚动
    windowFinger.addEventListener(
      "touchstart",
      ev => {
        const scrolltarget = plant.FindScrollNode(ev.target);
        if (scrolltarget) {
          const targetXpath = readXPath(scrolltarget);
          const isListener = this.scrollList.find(ele => {
            return ele === targetXpath;
          });
          if (!isListener) {
            this.scrollList.push(targetXpath);
            const domScroll = debounce(ev => {
              this.observer({ type: "scroll", evt: ev });
            }, delay);

            scrolltarget.addEventListener("touchstart", () => {
              scrolltarget.addEventListener("scroll", domScroll);
            });

            scrolltarget.addEventListener("touchend ", () => {
              scrolltarget.removeEventListener("scroll", domScroll);
            });
          }
        }
      }
    );

    windowFinger.addEventListener(
      "touchmove",
      debounce(ev => {
        this.observer({ type: "fingermove", evt: ev });
      }, delay)
    );

    windowFinger.addEventListener(
      "touchdrag",
      debounce(ev => {
        this.observer({ type: "touchdrag", evt: ev });
      }, delay)
    );
  }

  observer(obj) {
    let evt = obj.evt,
      param = {
        t: +new Date(),
        i: cookie.getCookie("ISEE_BIZ"),
        a: this.plant ? eventType.AGENT_PC : eventType.AGENT_MOBILE,
        u: window.location.href
      },
      event = null,
      _self = this;
    param.r = `${+new Date()}${eventType.SPLIT_DATA}`;
    const target = {
      openpage: function() {
        param.wh = `${document.documentElement.clientWidth}x${
          document.documentElement.clientHeight
        }`;
        _self.pushData(param);
      },
      click: function() {
        let point = "";
        if (evt instanceof TouchEvent) {
          point = `${eventType.SPLIT_DATA}${evt.changedTouches[0].screenX}-${
            evt.changedTouches[0].screenY
          }${eventType.SPLIT_DATA}`;
        } else if (evt instanceof MouseEvent) {
          point = `${eventType.SPLIT_DATA}${evt.screenX}-${evt.screenY}${
            eventType.SPLIT_DATA
          }`;
        }
        const link = plant.FindANode(evt.target, "a");
        if (link && link.target === "_blank") {
          param.r = `${param.r}${eventType.ACTION_TAB}${
            eventType.SPLIT_DATA
          }${readXPath(evt.target)}${point}${eventType.SPLIT_LINE}`;
        } else {
          param.r = `${param.r}${eventType.ACTION_CLICK}${
            eventType.SPLIT_DATA
          }${readXPath(evt.target)}${point}${eventType.SPLIT_LINE}`;
        }
        _self.pushData(param);
      },
      mouseover: function() {
        let tagName = evt.target.tagName.toLowerCase();
        let check = Checkhover(evt.target, ":hover");
        if (
          tagName === "li" ||
          tagName === "a" ||
          check ||
          evt.target.onmouseover ||
          (evt.__eventOrginList && evt.__eventOrginList.length > 0)
        ) {
          event = eventType.ACTION_HOVER;
          param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(
            evt.target
          )}${eventType.SPLIT_LINE}`;
          _self.pushData(param);
        }
      },
      unload: function() {
        _self.wsSocket.close();
      },
      inputChange: function() {
        event = eventType.ACTION_INPUT;
        if (evt.target.type === "password") {
          let length = evt.target.value.length;
          evt.target.value = "";
          for (var i = 0; i < length; i++) {
            evt.target.value += "*";
          }
        }
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(
          evt.target
        )}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`;
        _self.pushData(param);
      },
      select: function() {
        debugger
        event = eventType.ACTION_SELECT;
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(
          evt.target
        )}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`;
        _self.pushData(param);
      },
      mousedown: function() {},
      mousemove: function() {},
      scroll: function() {
        event = eventType.ACTION_SCROLL;
        let scroll,
          target = evt.target;
        if (
          evt.target.nodeName.toLowerCase() === "#document" ||
          evt.target.nodeName.toLowerCase() === "body" ||
          evt.target.nodeName.toLowerCase() === "html"
        ) {
          scroll =
            document.documentElement.scrollTop || document.body.scrollTop;
          target = document.body;
        } else {
          scroll = evt.target.scrollTop;
        }
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(
          target
        )}${eventType.SPLIT_DATA}${scroll}${eventType.SPLIT_DATA}${
          eventType.SPLIT_LINE
        }`;
        _self.pushData(param);
      },
      visibilitychange: function() {
        event = eventType.ACTION_SWITCH;
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${location.href}${
          eventType.SPLIT_LINE
        }`;
        _self.pushData(param);
      },
      fingermove: function() {},
      visibilityblur: function() {},
      touchdrag: function() {
        event = eventType.ACTION_DRAG;
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(
          evt.target
        )}${eventType.SPLIT_DATA}S:${evt.changedTouches[0].screenX}-${
          evt.changedTouches[0].screenY
        }${eventType.SPLIT_DATA}E:${
          evt._startPoint.changedTouches[0].screenX
        }-${evt._startPoint.changedTouches[0].screenY}${eventType.SPLIT_DATA}${
          eventType.SPLIT_LINE
        }`;
        _self.pushData(param, 100);
      },
      paint: function() {
        event = eventType.PAINT_START;
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}S:${
          evt.changedTouches[0].screenX
        }-${evt.changedTouches[0].screenY}${eventType.SPLIT_DATA}${
          eventType.SPLIT_DATA
        }${eventType.SPLIT_LINE}`;
        _self.wsSocket.send(JSON.stringify(param, 100));
      },
      popstate: function() {
        event = eventType.POP_STATE;
        param.r = `${param.r}${event}${eventType.SPLIT_LINE}`;
        _self.wsSocket.send(JSON.stringify(param));
      },
      hashchange: function() {
        event = eventType.HASH_CHANGE;
        param.r = `${param.r}${event}${eventType.SPLIT_LINE}`;
        _self.wsSocket.send(JSON.stringify(param));
      },
      inputBlur: function() {
        event = eventType.INPUT_BLUR;
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(
          evt.target
        )}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`;
        _self.pushData(param);
      },
      inputFocus: function() {
        event = eventType.INPUT_FOCUS;
        param.r = `${param.r}${event}${eventType.SPLIT_DATA}${readXPath(
          evt.target
        )}${eventType.SPLIT_DATA}${evt.target.value}${eventType.SPLIT_LINE}`;
        _self.pushData(param);
      }
    };
    target[obj.type]();
  }
  pushData (obj, time = 0) {
    let pushMode = getConfig('pushMode') || 'once'
    if (pushMode === 'once') {
      this.wsSocket.send(JSON.stringify(obj))
    } else {
      this.messageList.push(obj)
      if (this.messageList.length >= 30) {
        this.wsSocket.send(JSON.stringify(this.messageList))
        this.messageList = []
      }
    }
  }
}

document.addEventListener(
  "DOMContentLoaded",
  function(event) {
    var iseebiz = cookie.getCookie("ISEE_BIZ");
    var ISEE_RE = cookie.getCookie("ISEE_RE");
    if (process.env.NODE_ENV === "production") {
      if (ISEE_RE) return;
      if (iseebiz) {
        const Clairvoyant = (window.clairvoyant = new clairvoyant());
        Clairvoyant.wsSocket.onopen = function(evt) {
          console.log("Connection start.");
          Clairvoyant.observer({ type: "openpage", evt: evt });
          let end = getConfig('end')
          let type = getConfig('type')
          if (end && type) {
            if (type === "history") {
              if (location.pathname.indexOf(end) === 0) {
                cookie.delCookie("ISEE_BIZ");
              }
            } else {
              if (location.hash === end) {
                cookie.delCookie("ISEE_BIZ");
              }
            }
          }
        };
        Clairvoyant.wsSocket.onmessage = function(evt) {
          // console.log("server:" + evt.data)
        };
        Clairvoyant.wsSocket.onclose = function(evt) {
          console.log("Connection closed.");
        };
        Clairvoyant.wsSocket.onerror = function(evt) {
          console.log(evt);
        };
        Clairvoyant.init();
      }
    } else {
      const Clairvoyant = (window.clairvoyant = new clairvoyant());
      Clairvoyant.wsSocket.onopen = function(evt) {
        console.log("Connection start.");
        Clairvoyant.observer({ type: "openpage", evt: evt });

        let end = getConfig('end')
        let type = getConfig('type')
        if (end && type) {
          if (type === "history") {
            if (location.pathname.indexOf(end) === 0) {
              cookie.delCookie("ISEE_BIZ");
            }
          } else {
            if (location.hash === end) {
              cookie.delCookie("ISEE_BIZ");
            }
          }
        }
      };
      Clairvoyant.wsSocket.onmessage = function(evt) {
        // console.log("server:" + evt.data)
      };
      Clairvoyant.wsSocket.onclose = function(evt) {
        console.log("Connection closed.");
      };
      Clairvoyant.wsSocket.onerror = function(evt) {
        console.log(evt);
      };
      Clairvoyant.init();
    }
  },
  { noShadow: true }
);
