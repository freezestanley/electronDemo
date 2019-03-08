/*
 * options
 *  - callback
 *  - includeWindows default false    false / true
 */
export default class proxyEvent {
  //  constructor (callback = null) {
  constructor(options = null) {
    let _self = this;
    this._callback = options ? options.callback : null;
    this._includeWindows = options
      ? options.includeWindows
        ? options.includeWindows
        : false
      : false;
    if (this._includeWindows) {
      this.initEventproxy(window);
    }
    this.initEventproxy(HTMLElement.prototype);
  }

  get callback() {
    return this._callback;
  }

  set callback(fun) {
    this._callback = fun;
  }

  initEventproxy(target) {
    let _self = this;
    target["__proxy"] = {
      __addEvent: target.addEventListener,
      __removeEvent: target.removeEventListener,
      __toggleProxy: true,
      __firstDispath: true
    };

    Object.defineProperty(target, "addEventListener", {
      get: function() {
        return function(type, listener, options, useCapture) {
          let _this = this;
          // this.__eventList = this.__eventList
          //   ? this.__eventList
          //   : new Array();
          // this.__eventOrginList = this.__eventOrginList
          //   ? this.__eventOrginList
          //   : new Array();
          this.__eventList = this.__eventList ? this.__eventList : {};

          this.__eventOrginList = this.__eventOrginList
            ? this.__eventOrginList
            : {};

          this.__eventList[type] = this.__eventList[type]
            ? this.__eventList[type]
            : [];
          this.__eventOrginList[type] = this.__eventOrginList[type]
            ? this.__eventOrginList[type]
            : [];

          let listenerCallback;
          if (typeof options === "object") {
            if (options.shadow) {
              listenerCallback = e => {
                listener.call(_this, e);
              };
            }
          } else {
            listenerCallback =
              this.__eventList[type].length === 0 && this.__proxy.__firstDispath
                ? e => {
                    if (_this.__proxy.__toggleProxy) {
                      _self._callback ? _self._callback.call(_this, e) : null;
                    }
                    listener.call(_this, e);
                  }
                : e => {
                    listener.call(_this, e);
                  };
          }

          this.__proxy.__addEvent.call(
            this,
            type,
            listenerCallback,
            options,
            useCapture
          );

          this.__eventList[type].push({ type, listener: listenerCallback });
          this.__eventOrginList[type].push({ type, listener });
        };
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(target, "removeEventListener", {
      get: function() {
        return function(type, listener, options, useCapture) {
          let _this = this;

          if (!this.__eventOrginList) return;
          if (!this.__eventOrginList[type]) return;

          this.__eventOrginList = this.__eventOrginList
            ? this.__eventOrginList
            : {};

          let index = this.__eventOrginList[type].findIndex((ele, idx, arr) => {
            return ele.listener === listener;
          });
          if (index >= 0) {
            let event = this.__eventList[type][index].listener;
            this.__proxy.__removeEvent.call(
              this,
              type,
              event,
              options,
              useCapture
            );
            this.__eventOrginList[type].splice(index, 1);
            this.__eventList[type].splice(index, 1);
          }
        };
      },
      enumerable: true,
      configurable: true
    });

    for (let i in target) {
      if (i.indexOf("on") === 0) {
        let abc;
        Object.defineProperty(target, i, {
          get: function(e) {
            return this.__pro && this.__pro[`__${i}`]
              ? this.__pro[`__${i}`]
              : null;
          },
          set: function(newValue) {
            this.__pro = this.__pro ? this.__pro : Object.create(this.__proxy);
            let type = i.split("on")[1];
            if (newValue) {
              this.addEventListener(type, newValue);
            } else {
              this.removeEventListener(type, this.__pro[`__${i}`]);
            }
            abc = newValue;
            this.__pro[`__${i}`] = abc;
          },
          enumerable: true,
          configurable: true
        });
      }
    }
  }
}
