export default class ProxyHistoryApi {
  constructor (options) {
    this._onStateChange =
      options && options.onStateChange ? options.onStateChange : null
    this.initProxy(window.history)
  }
  set onStateChange (fun) {
    this._onStateChange = fun
  }
  get onStateChange () {
    return this._onStateChange
  }
  initProxy (target) {
    const self = this
    target['__proxy'] = {
      __pushState: target.pushState,
      __replaceState: target.replaceState
    }
    Object.defineProperty(target, 'pushState', {
      get () {
        const _self = this
        return function (state, title, uri) {
          _self.__proxy.__pushState.call(this, state, title, uri)
          if (self._onStateChange) {
            const actionType = 'pushState'
            self._onStateChange({ actionType, state, title, uri })
          }
        }
      },
      enumerable: true,
      configurable: true
    })
    Object.defineProperty(target, 'replaceState', {
      get () {
        const _self = this
        return function (state, title, uri) {
          _self.__proxy.__pushState.call(this, state, title, uri)
          if (self._onStateChange) {
            const actionType = 'replaceState'
            self._onStateChange({ actionType, state, title, uri })
          }
        }
      },
      enumerable: true,
      configurable: true
    })
  }
}
