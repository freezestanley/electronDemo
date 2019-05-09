// import {throttle, debounce} from '../socket'
import { readXPath } from '../xpath'

const TOUCH_TAP = 'tap'
const TOUCH_LONGTAP = 'longtap'
const TOUCH_DRAGTAP = 'dragtap'

export class FingerType {
  constructor (state) {
    this._prePoint = null
    this._nextPoint = null
  }
  start (evt) {
    evt.time = +new Date()
    this._nextPoint = null
    this._prePoint = evt
  }
  end (evt) {
    const prePoint = this._prePoint.targetTouches[0]
    const curPoint = evt.changedTouches[0]
    const nextPoint = this._nextPoint ? this._nextPoint.targetTouches[0] : null
    let type = false
    if (nextPoint && prePoint.identifier === curPoint.identifier && nextPoint.identifier === prePoint.identifier) {
      type = TOUCH_DRAGTAP
    } else if (prePoint.identifier === curPoint.identifier) {
      if (curPoint.pageX <= prePoint.pageX + 10 && curPoint.pageX >= prePoint.pageX - 10 && (curPoint.pageY <= prePoint.pageY + 10 && curPoint.pageY >= prePoint.pageY - 10)) {
        const conTime = +new Date() - this._prePoint.time
        if (conTime <= 500) {
          type = TOUCH_TAP
        } else {
          type = TOUCH_LONGTAP
        }
      } else {
        type = TOUCH_DRAGTAP
      }
    }
    return type
  }
  move (evt) {
    if (this._prePoint.targetTouches[0].identifier === evt.targetTouches[0].identifier) {
      evt.time = +new Date()
      this._nextPoint = evt
    }
  }
}

export const fingerEventsCallback = {
  touchstart (ev, _this = this, eventsFunc) {
    if (eventsFunc) {
      _this._touchstart = eventsFunc['touchstart']
    }
    _this.finger = new FingerType()
    _this.finger.start(ev)
    _this._startPoint = ev
    _this._startTarget = ev.target
    _this._startXpath = readXPath(ev.target)
    // 临时解决办法，根据canvas是否含有touchmove事件来判断是否需要发送paint事件（是否为签名）
    if (ev.target.tagName.toLowerCase() === 'canvas' && (ev.target.__proxy && ev.target.__proxy.__eventOrginList && ev.target.__proxy.__eventOrginList.touchmove.length > 0)) {
      const canvasEle = ev.changedTouches[0].target
      const x = ev.changedTouches[0].clientX - canvasEle.getBoundingClientRect().left + ''
      const y = ev.changedTouches[0].clientY - canvasEle.getBoundingClientRect().top + ''
      _this._movePoint = `${x.split('.')[0]}-${y.split('.')[0]}€`
    } else {
      _this._movePoint = null
    }
    if (_this._touchstart) _this._touchstart(ev)
  },
  touchend (ev, _this = this, eventsFunc) {
    if (eventsFunc) {
      _this._touchend = eventsFunc['touchend']
      _this._touchdrag = eventsFunc['touchdrag']
      _this._touchPaint = eventsFunc['touchPaint']
    }
    const type = _this.finger.end(ev)
    if (ev.target == _this._startTarget) {
      ev._xpath = _this._startXpath
    } else {
      ev._xpath = null
    }
    if (type === TOUCH_TAP && _this._touchtap) {
      _this._touchtap(ev)
    }

    if (type === TOUCH_DRAGTAP) {
      if (_this._touchdrag) {
        ev._startPoint = _this._startPoint
        _this._touchdrag(ev)
      }
      if (_this._touchPaint && ev.target.tagName.toLowerCase() === 'canvas' && _this._movePoint) {
        const allPoints = _this._movePoint.split('€').filter(item => !!item)
        const movePoints = []
        let prevIndex = 0
        allPoints.forEach((point, index) => {
          if (index === 0 || index === allPoints.length - 1) {
            movePoints.push(point)
            prevIndex = index
          } else {
            const [prevPointX, prevPointY] = allPoints[prevIndex].split('-')
            const [pointX, pointY] = point.split('-')
            if (Math.abs(pointX - prevPointX) > 3 || Math.abs(pointY - prevPointY) > 3) {
              movePoints.push(point)
              prevIndex = index
            }
          }
        })
        ev._movePoint = movePoints.join('€')
        _this._touchPaint(ev)
      }
    }

    if (_this._touchend) _this._touchend(ev)
    _this._startPoint = null
    _this._movePoint = null
  },
  touchmove (ev, _this = this, eventsFunc) {
    if (eventsFunc) {
      _this._touchmove = eventsFunc['touchmove']
    }
    _this.finger.move(ev)
    if (_this._movePoint) {
      const canvasEle = ev.changedTouches[0].target
      const x = ev.changedTouches[0].clientX - canvasEle.getBoundingClientRect().left + ''
      const y = ev.changedTouches[0].clientY - canvasEle.getBoundingClientRect().top + ''
      _this._movePoint += `${x.split('.')[0]}-${y.split('.')[0]}€`
    }
    if (_this._touchmove) _this._touchmove(ev)
  }
}
export default class Finger {
  constructor (node = window, ev) {
    this._touchstart = null
    this._touchmove = null
    this._touchend = null
    this._touchtap = null
    this._touchdrag = null
    this._startPoint = null
    this._movePoint = null

    if (ev) {
      this.finger = new FingerType()
      this.finger.start(ev)
      this._startPoint = ev
      if (ev.changedTouches[0]) {
        const clientX = ev.changedTouches[0].clientX + ''
        const clientY = ev.changedTouches[0].clientY + ''
        this._movePoint = `${clientX.split('.')[0]}-${clientY.split('.')[0]}€`
      }

      if (this._touchstart) this._touchstart(ev)
    }

    node.addEventListener(
      'touchstart',
      ev => {
        fingerEventsCallback['touchstart'](ev, this)
      },
      {
        passive: false,
        noShadow: true
      }
    )

    node.addEventListener(
      'touchend',
      ev => {
        fingerEventsCallback['touchend'](ev, this)
      },
      {
        passive: false,
        noShadow: true
      }
    )

    node.addEventListener(
      'touchmove',
      ev => {
        fingerEventsCallback['touchmove'](ev, this)
      },
      {
        passive: false,
        noShadow: true
      }
    )
  }
  get ontouchstart () {
    return this._touchstart
  }
  set ontouchstart (param) {
    this._touchstart = param
  }
  get ontouchend () {
    return this._touchend
  }
  set ontouchend (param) {
    this._touchend = param
  }
  get ontouchmove () {
    return this._touchmove
  }
  set ontouchmove (param) {
    this._touchmove = param
  }
  get ontouchtap () {
    return this._touchtap
  }
  set ontouchtap (param) {
    this._touchtap = param
  }
  get ontouchdrag () {
    return this._touchdrag
  }
  set ontouchdrag (param) {
    this._touchdrag = param
  }
  get ontouchpaint () {
    return this._touchPaint
  }
  set ontouchpaint (param) {
    this._touchPaint = param
  }

  addEventListener (eventType, callback, options) {
    switch (eventType) {
      case 'touchstart':
        this.ontouchstart = callback
        break
      case 'touchend':
        this.ontouchend = callback
        break
      case 'touchmove':
        this.ontouchmove = callback
        break
      case 'touchtap':
        this.ontouchtap = callback
        break
      case 'touchdrag':
        this.ontouchdrag = callback
        break
      case 'touchpaint':
        this.ontouchpaint = callback
        break
    }
  }
  removeEventListener (eventType, callback, options) {
    switch (eventType) {
      case 'touchstart':
        this.ontouchstart = null
        break
      case 'touchend':
        this.ontouchend = null
        break
      case 'touchmove':
        this.ontouchmove = null
        break
      case 'touchtap':
        this.ontouchtap = null
        break
      case 'touchdrag':
        this.ontouchdrag = null
        break
      case 'touchpaint':
        this.ontouchpaint = null
        break
    }
  }
}
