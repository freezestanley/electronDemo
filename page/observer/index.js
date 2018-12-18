import {throttle, debounce} from '../socket'

function domObserver (node = document.body, config, mutation) {
  return ((n, c)=>{
    this.node = n
    this.config = c
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
    this.observer = new MutationObserver(debounce((obj) => {
      mutation(obj)
    }, 500))
    this.start = () => {
      this.observer.observe(this.node, this.config)
    }
    this.end = () => {
      this.observer.disconnect()
    }
  })(node, config)
}
export default domObserver

// export default Observer = (node) => {
//   let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
//   // 选择目标节点
//   let target = node || document.body
//     // 创建观察者对象
//   let observer = new MutationObserver(function(mutations) { 
//     console.dir(mutations)
//     mutations.forEach(function(mutation) { 
//       console.log('******************')
//       console.log(mutation.type); 
//       console.log('******************')
//     }); 
//   }); 
//     // 配置观察选项:
//   let config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true } 
//     // 传入目标节点和观察选项
//   observer.observe(target, config); 
//   // 随后,你还可以停止观察
//   // observer.disconnect();
// }