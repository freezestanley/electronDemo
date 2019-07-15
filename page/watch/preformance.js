import '@fastly/performance-observer-polyfill/polyfill'
const performance = window.performance || window.msPerformance || window.webkitPerformance

class Pf {
  constructor (options = {}) {
    this.pf = performance
    this.observer = new PerformanceObserver(options.eventCallback)
  }
  eventCallback (e, t) {
    console.log(e, t)
  }
  observe (type = ['resource']) {
    this.observer.observe({ entryTypes: [...type] })
  }
  get getMemory () {
    return {
      memtotal: performance.memory.usedJSHeapSize,
      memused: performance.memory.totalJSHeapSize,
      memlimit: performance.memory.jsHeapSizeLimit
    }
  }
  get nowTime () {
    return performance.now()
  }
  analysePfTiming (obj) {
    // let result = {}
    // result.unload = Math.abs(obj.unloadEventEnd - obj.unloadEventStart)
    // // result.redirectCount = obj.redirectCount
    // result.redirectTime = Math.abs(obj.redirectEnd - obj.redirectStart)
    // result.dnsTime = Math.abs(obj.domainLookupEnd - obj.domainLookupStart)
    // result.tcp = Math.abs(obj.connectEnd - obj.connectStart)
    // result.request = Math.abs(obj.responseStart - obj.requestStart)
    // result.http = Math.abs(obj.responseEnd - obj.responseStart)
    // result.dom = Math.abs(obj.domComplete - obj.domInteractive)
    // result.white = Math.abs(obj.responseStart - obj.navigationStart)
    // result.content = Math.abs(obj.domContentLoadedEventEnd - obj.domContentLoadedEventStart)
    // result.domReady = Math.abs(obj.domContentLoadedEventEnd - obj.navigationStart)
    // result.Load = Math.abs(obj.loadEventEnd - obj.navigationStart)
    // return result
    return obj
  }
  analysePfNavigation (obj) {
    // let result = {}
    // switch (obj.type) {
    //   case TYPE_NAVIGATENEXT:
    //     result.origin = 'normal'
    //     break
    //   case TYPE_RELOAD:
    //     result.origin = 'reload'
    //     break
    //   case TYPE_BACK_FORWARD:
    //     result.origin = 'history'
    //     break
    //   case TYPE_UNDEFINED:
    //     result.origin = 'other'
    //     break
    // }
    // result.unload = Math.abs(obj.unloadEventEnd - obj.unloadEventStart)
    // result.redirectCount = obj.redirectCount
    // result.redirectTime = Math.abs(obj.redirectEnd - obj.redirectStart)
    // result.dnsTime = Math.abs(obj.domainLookupEnd - obj.domainLookupStart)
    // result.tcp = Math.abs(obj.connectEnd - obj.connectStart)
    // result.request = Math.abs(obj.responseStart - obj.requestStart)
    // result.http = Math.abs(obj.responseEnd - obj.responseStart)
    // result.dom = Math.abs(obj.domComplete - obj.domInteractive)
    // result.content = Math.abs(obj.domContentLoadedEventEnd - obj.domContentLoadedEventStart)
    // return result
    return obj
  }
  analysePfResource (obj) {
    // let result = {}
    // result.file = obj.name
    // result.type = obj.initiatorType
    // result.duration = obj.duration
    // result.dnsTime = Math.abs(obj.domainLookupEnd - obj.domainLookupStart)
    // result.tcp = Math.abs(obj.connectEnd - obj.connectStart)
    // result.http = Math.abs(obj.responseEnd - obj.responseStart)
    // result.request = Math.abs(obj.responseStart - obj.requestStart)
    // result.size = obj.transferSize
    // return result
    return obj
  }
  getTiming () {
    return performance.timing
  }
  getNavigation () {
    return performance.getEntriesByType('navigation')[0]
  }
  getResource () {
    return performance.getEntriesByType('resource')
  }
  startMark (name) {
    performance.mark(name)
  }
  endMark (name) {
    performance.mark(name)
  }
  clearMark () {
    performance.clearMarks()
  }
  clearResource () {
    performance.clearResourceTimings()
  }
  clearMeasures () {
    performance.clearMeasures()
  }
  clear () {
    this.clearMark()
    this.clearMeasures()
    this.clearResource()
  }
  getMark () {
    return performance.getEntriesByType('mark')
  }
  getMarkByName (name) {
    return performance.getEntriesByName(name)
  }
  getMeasure () {
    return performance.getEntriesByType('measure')
  }
  getPerformanceInfo () {
    let result = {}
    let _self = this
    result.timing = this.analysePfTiming(performance.timing)
    result.navigation = this.analysePfNavigation(this.getNavigation())
    this.getResource().map((e) => {
      let item = _self.analysePfResource(e)
      result[item.initiatorType] = result[item.initiatorType] || []
      result[item.initiatorType].push(item)
    })
    this.clear()
    return result
  }
}
export default Pf
