export const IsPc = () => {
  let userAgentInfo = navigator.userAgent,
      Agents = ["Android", "iPhone",
              "SymbianOS", "Windows Phone",
              "iPad", "iPod"],
      flag = true
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag
}


export const IsMobile = () => {
  var u = navigator.userAgent;
  if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
    return 'android'
  } else if (u.indexOf('iPhone') > -1) {
    return 'iphone'
  } else if (u.indexOf('Windows Phone') > -1) {
    return 'winphone'
  }
}

export const IsWeixin = () => { 
  var ua = navigator.userAgent.toLowerCase(); 
  return ua.indexOf('micromessenger') !== -1
}

export const FindScrollNode = function FindScrollNode (target) { 
  if (!target || target.nodeName === '#document') return false
  let style = window.getComputedStyle(target)
  if (style.overflowX === 'scroll' || style.overflowX === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'auto') {
    return target
  } else {
    if (target.tagName.toLowerCase() === 'HTML' || !target.parentElement || target.parentElement.tagName.toLowerCase() === 'HTML') {
      return false
    } else {
      return FindScrollNode(target.parentElement) 
    }
  }
}
export const FindANode = function FindANode (target, nodeName) { 
  if (!target || !nodeName) return false
  if (target.nodeName.toLowerCase() === nodeName.toLowerCase()) {
    return target
  } else {
    return FindANode(target.parentElement)
  }
}