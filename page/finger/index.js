import {throttle, debounce} from '../socket'

const TOUCH_TAP = 'tap'
const TOUCH_LONGTAP = 'longtap'
const TOUCH_DRAGTAP = 'dragtap'

export class fingerType {
  constructor (state) {
    this._prePoint = null
    this._nextPoint = null
  }
  start (evt) {
    evt.time = +new Date
    this._nextPoint = null
    this._prePoint = evt
  }
  end (evt) {
    const prePoint = this._prePoint.targetTouches[0],
          curPoint = evt.changedTouches[0],
          nextPoint = this._nextPoint ? this._nextPoint.targetTouches[0] : null
    let type = false
    if (nextPoint && (prePoint.identifier === curPoint.identifier) && (nextPoint.identifier === prePoint.identifier)) {
      type = TOUCH_DRAGTAP
    } else if (prePoint.identifier === curPoint.identifier ) {
      if ((prePoint.pageX === curPoint.pageX) && (prePoint.pageY === curPoint.pageY)) {
        const conTime = (+new Date()) - this._prePoint.time
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
      evt.time = +new Date
      this._nextPoint = evt
    }
  }
}

export default class finger {
  constructor(node = window, ev){
    this._touchstart = null
    this._touchmove = null
    this._touchend = null
    this._touchtap = null
    this._touchdrag = null
    this._startPoint = null

    if (ev) {
      this.finger = new fingerType()
      this.finger.start(ev)
      this._startPoint = ev
      if(this._touchstart)
        this._touchstart(ev)
    }
    
    node.addEventListener('touchstart', (ev)=>{
      // ev.preventDefault()
      this.finger = new fingerType()
      this.finger.start(ev)
      this._startPoint = ev
      if(this._touchstart)
        this._touchstart(ev)

    }, { passive: false })

    node.addEventListener('touchend', (ev) => {
      // ev.preventDefault()
      const type = this.finger.end(ev)
      if (type === TOUCH_TAP && this._touchtap) {
        this._touchtap(ev)
      }

      if (type === TOUCH_DRAGTAP && this._touchdrag) {
        ev._startPoint = this._startPoint
        this._touchdrag(ev)
      }

      if (this._touchend)
        this._touchend(ev)

      this._startPoint = null
    }, { passive: false })

    node.addEventListener('touchmove', (ev) => {
      this.finger.move(ev)
      if (this._touchmove)
        this._touchmove(ev) 
    }, { passive: false })
  }
  get ontouchstart (){
    return this._touchstart
  }
  set ontouchstart (param) {
    this._touchstart = param
  }
  get ontouchend (){
    return this._touchend
  }
  set ontouchend (param) {
    this._touchend = param
  }
  get ontouchmove (){
    return this._touchmove
  }
  set ontouchmove (param) {
    this._touchmove = param
  }
  get ontouchtap (){
    return this._touchtap
  }
  set ontouchtap (param) {
    this._touchtap = param
  }
  get ontouchdrag (){
    return this._touchdrag
  }
  set ontouchdrag (param) {
    this._touchdrag = param
  }

  addEventListener (eventType, callback) {
    switch (eventType) {
      case 'touchstart':
        this.ontouchstart = callback
        break;
      case 'touchend':
        this.ontouchend = callback
        break;
      case 'touchmove':
        this.ontouchmove = callback
        break;
      case 'touchtap':
        this.ontouchtap = callback
        break;
      case 'touchdrag':
        this.ontouchdrag = callback
        break;
    }
  }
  removeEventListener (eventType, callback) {
    switch (eventType) {
      case 'touchstart':
        this.ontouchstart = null
        break;
      case 'touchend':
        this.ontouchend = null
        break;
      case 'touchmove':
        this.ontouchmove = null
        break;
      case 'touchtap':
        this.ontouchtap = null
        break;
      case 'touchdrag':
        this.ontouchdrag = null
        break;
    }
  }
}