// import {throttle, debounce} from '../socket'

const TOUCH_TAP = 'tap'
const TOUCH_LONGTAP = 'longtap'
const TOUCH_DRAGTAP = 'dragtap'

export class FingerType {
  constructor(state) {
    this._prePoint = null
    this._nextPoint = null
  }
  start(evt) {
    evt.time = +new Date()
    this._nextPoint = null
    this._prePoint = evt
  }
  end(evt) {
    const prePoint = this._prePoint.targetTouches[0]
    const curPoint = evt.changedTouches[0]
    const nextPoint = this._nextPoint ? this._nextPoint.targetTouches[0] : null
    let type = false
    if (
      nextPoint &&
      prePoint.identifier === curPoint.identifier &&
      nextPoint.identifier === prePoint.identifier
    ) {
      type = TOUCH_DRAGTAP
    } else if (prePoint.identifier === curPoint.identifier) {
      if (
        curPoint.pageX <= prePoint.pageX + 10 &&
        curPoint.pageX >= prePoint.pageX - 10 &&
        (curPoint.pageY <= prePoint.pageY + 10 &&
          curPoint.pageY >= prePoint.pageY - 10)
      ) {
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
  move(evt) {
    if (
      this._prePoint.targetTouches[0].identifier ===
      evt.targetTouches[0].identifier
    ) {
      evt.time = +new Date()
      this._nextPoint = evt
    }
  }
}

export default class Finger {
  constructor(node = window, ev) {
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
        // ev.preventDefault()
        this.finger = new FingerType()
        this.finger.start(ev)
        this._startPoint = ev
        if (ev.target.tagName.toLowerCase() === 'canvas') {
          const canvasEle = ev.changedTouches[0].target
          const x =
            ev.changedTouches[0].clientX -
            canvasEle.getBoundingClientRect().left +
            ''
          const y =
            ev.changedTouches[0].clientY -
            canvasEle.getBoundingClientRect().top +
            ''
          this._movePoint = `${x.split('.')[0]}-${y.split('.')[0]}€`
        } else {
          this._movePoint = null
        }
        if (this._touchstart) this._touchstart(ev)
      },
      {
        passive: false,
        noShadow: true
      }
    )

    node.addEventListener(
      'touchend',
      ev => {
        // ev.preventDefault()
        const type = this.finger.end(ev)
        if (type === TOUCH_TAP && this._touchtap) {
          this._touchtap(ev)
        }

        if (type === TOUCH_DRAGTAP) {
          if (this._touchdrag) {
            ev._startPoint = this._startPoint
            this._touchdrag(ev)
          }
          if (
            this._touchPaint &&
            ev.target.tagName.toLowerCase() === 'canvas'
          ) {
            const allPoints = this._movePoint.split('€').filter(item => !!item)
            const movePoints = []
            let prevIndex = 0
            allPoints.forEach((point, index) => {
              if (index === 0 || index === allPoints.length - 1) {
                movePoints.push(point)
                prevIndex = index
              } else {
                const [prevPointX, prevPointY] = allPoints[prevIndex].split('-')
                const [pointX, pointY] = point.split('-')
                if (
                  Math.abs(pointX - prevPointX) > 3 ||
                  Math.abs(pointY - prevPointY) > 3
                ) {
                  movePoints.push(point)
                  prevIndex = index
                }
              }
            })
            ev._movePoint = movePoints.join('€')
            this._touchPaint(ev)
          }
        }

        if (this._touchend) this._touchend(ev)

        this._startPoint = null
        this._movePoint = null
      },
      {
        passive: false,
        noShadow: true
      }
    )

    node.addEventListener(
      'touchmove',
      ev => {
        this.finger.move(ev)
        if (this._movePoint) {
          const canvasEle = ev.changedTouches[0].target
          const x =
            ev.changedTouches[0].clientX -
            canvasEle.getBoundingClientRect().left +
            ''
          const y =
            ev.changedTouches[0].clientY -
            canvasEle.getBoundingClientRect().top +
            ''
          this._movePoint += `${x.split('.')[0]}-${y.split('.')[0]}€`
        }
        if (this._touchmove) this._touchmove(ev)
      },
      {
        passive: false,
        noShadow: true
      }
    )
  }
  get ontouchstart() {
    return this._touchstart
  }
  set ontouchstart(param) {
    this._touchstart = param
  }
  get ontouchend() {
    return this._touchend
  }
  set ontouchend(param) {
    this._touchend = param
  }
  get ontouchmove() {
    return this._touchmove
  }
  set ontouchmove(param) {
    this._touchmove = param
  }
  get ontouchtap() {
    return this._touchtap
  }
  set ontouchtap(param) {
    this._touchtap = param
  }
  get ontouchdrag() {
    return this._touchdrag
  }
  set ontouchdrag(param) {
    this._touchdrag = param
  }
  get ontouchpaint() {
    return this._touchPaint
  }
  set ontouchpaint(param) {
    this._touchPaint = param
  }

  addEventListener(eventType, callback, options) {
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
  removeEventListener(eventType, callback, options) {
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
