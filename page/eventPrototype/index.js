/*
 * options
 *  - callback  守卫
 *  - includeWindows default false    false / true
 *  - mode  once  开始前只执行一次  every 每次都执行
 *    once  noShadow 当列队内都保持不要守卫则守卫不执行
 *    every noShadow 当前事件被执行但是守卫不会被执行
 *  - getEventListenerList(type) 获取事件列队
 */
/**
 * Object.getOwnPropertyDescriptor(window, 'onLineCallBack')
 */
export default class EventPrototype {
  constructor (options = null) {
    // let _self = this
    this._callback = options && options.callback
    const target = options && options.target
    this.initEventPrototype(target)
  }

  get callback () {
    return this._callback
  }

  set callback (cb) {
    this._callback = cb
  }

  initEventPrototype (e = Event.prototype) {
    e['_stopPropagation'] = e.stopPropagation
    Object.defineProperty(e, 'stopPropagation', {
      get () {
        return function () {
          this._stopPropagation()
          console.log('get')
        }
      },
      enumerable: true,
      configurable: true
    })
  }
}
// module.exports = proxyEvent
