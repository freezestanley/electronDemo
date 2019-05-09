// import {throttle, debounce} from '../socket'
import { readXPath } from '../xpath'

const MOUSE_DRAG = 'mousedrag'
const MOUSE_CLICK = 'mouseclick'
const MOUSE_HOLD = 'mousehold'

export class MouseType {
  constructor (state) {
    this._prePoint = null
    this._nextPoint = null
  }
  start (evt) {
    evt.time = Date.now()
    this._nextPoint = null
    this._prePoint = evt
  }
  end (evt) {
    const prePoint = this._prePoint.target
    const curPoint = evt.target
    let type
    if (Math.abs(curPoint.pageX - prePoint.pageX) <= 10 || Math.abs(curPoint.pageY - prePoint.pageY) <= 10) {
      const conTime = +new Date() - this._prePoint.time
      if (conTime <= 500) {
        type = MOUSE_CLICK
      } else {
        type = MOUSE_HOLD
      }
    } else {
      type = MOUSE_DRAG
    }
    return type
  }
}

export const mouseEventsCallback = {
  mousedown (ev, _this = this, eventsFunc) {
    if (eventsFunc) {
      _this._mousedown = eventsFunc['mousedown']
    }
    _this.mouse = new MouseType()
    _this.mouse.start(ev)
    _this._startPoint = ev
    _this._startTarget = ev.target
    _this._startXpath = readXPath(ev.target)
    if (_this._mousedown) _this._mousedown(ev)
  },
  mouseup (ev, _this = this, eventsFunc) {
    if (eventsFunc) {
      _this._mouseup = eventsFunc['mouseup']
      _this._mousedrag = eventsFunc['mousedrag']
      _this._mouseclick = eventsFunc['mouseclick']
    }
    const type = _this.mouse.end(ev)
    if (ev.target == _this._startTarget) {
      ev._xpath = _this._startXpath
    } else {
      ev._xpath = null
    }

    if (type === MOUSE_CLICK && _this._mouseclick) {
      _this._mouseclick(ev)
    }

    if (type === MOUSE_DRAG && _this._mousedrag) {
      ev._startPoint = _this._startPoint
      _this._mousedrag(ev)
    }

    if (_this._mouseup) _this._mouseup(ev)

    _this._startPoint = null
  },
  mousemove (ev, _this = this, eventsFunc) {
    if (eventsFunc) {
      _this._mousemove = eventsFunc['mousemove']
    }
    if (_this._mousemove) _this._mousemove(ev)
  }
}

export default class Mouse {
  constructor (node = window, ev) {
    this._mousedown = null
    this._mousemove = null
    this._mouseup = null
    this._mousedrag = null
    this._mouseclick = null
    this._mousehold = null

    node.addEventListener(
      'mousedown',
      ev => {
        mouseEventsCallback['mousedown'](ev, this)
      },
      {
        passive: false,
        noShadow: true
      }
    )

    node.addEventListener(
      'mouseup',
      ev => {
        mouseEventsCallback['mouseup'](ev, this)
      },
      {
        passive: false,
        noShadow: true
      }
    )

    node.addEventListener(
      'mousemove',
      ev => {
        mouseEventsCallback['mousemove'](ev, this)
      },
      {
        passive: false,
        noShadow: true
      }
    )
  }
  get onmousedown () {
    return this._mousedown
  }
  set onmousedown (param) {
    this._mousedown = param
  }
  get onmousemove () {
    return this._mousemove
  }
  set onmousemove (param) {
    this._mousemove = param
  }
  get onmouseup () {
    return this._mouseup
  }
  set onmouseup (param) {
    this._mouseup = param
  }
  get onmousedrag () {
    return this._mousedrag
  }
  set onmousedrag (param) {
    this._mousedrag = param
  }
  get onmouseclick () {
    return this._mouseclick
  }
  set onmouseclick (param) {
    this._mouseclick = param
  }

  addEventListener (eventType, callback, options) {
    switch (eventType) {
      case 'mousedown':
        this.onmousedown = callback
        break
      case 'mousemove':
        this.onmousemove = callback
        break
      case 'mouseup':
        this.onmouseup = callback
        break
      case 'mousedrag':
        this.onmousedrag = callback
        break
      case 'mouseclick':
        this.onmouseclick = callback
        break
    }
  }
  removeEventListener (eventType, callback, options) {
    switch (eventType) {
      case 'mousedown':
        this.onmousedown = null
        break
      case 'mousemove':
        this.onmousemove = null
        break
      case 'mouseup':
        this.onmouseup = null
        break
      case 'mousedrag':
        this.onmousedrag = null
        break
      case 'mouseclick':
        this.onmouseclick = null
        break
    }
  }
}
