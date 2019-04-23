// 判断两个矩形是否重叠
export const isOverlap = (rect1, rect2) => {
  const l1 = {
    x: rect1.x,
    y: rect1.y
  }
  const r1 = {
    x: rect1.x + rect1.width,
    y: rect1.y + rect1.height
  }
  const l2 = {
    x: rect2.x,
    y: rect2.y
  }
  const r2 = {
    x: rect2.x + rect2.width,
    y: rect2.y + rect2.height
  }
  return !(l1.x >= r2.x || l2.x >= r1.x || l1.y >= r2.y || l2.y >= r1.y)
}

// 获取translate所有坐标
export const getDelta = style => {
  const delta = {
    x: '0',
    y: '0',
    z: '0'
  }
  const translateArr = style
    .match(/(translate(X|Y|3D)?\().*?(?=\))/gi)
    .map(attr => attr.replace('translate', '').toLowerCase())
  translateArr.every(style => {
    if (style.indexOf('3d(') > -1) {
      const arr = style.replace('3d(', '').split(',')
      delta.x = arr[0].trim()
      delta.y = arr[1].trim()
      delta.z = arr[2].trim()
      return false
    } else if (style.indexOf('x(') > -1) {
      delta.x = style.replace('x(', '').trim()
      return true
    } else if (style.indexOf('y(') > -1) {
      delta.y = style.replace('y(', '').trim()
      return true
    } else {
      const arr = style.replace('(', '').split(',')
      delta.x = arr[0].trim()
      delta.y = arr[1].trim()
      return false
    }
  })
  return delta
}

export const setMask = (xpath, config = true) => {
  const ele = document.evaluate(xpath, document).iterateNext()
  const { top, left, bottom, right, width, height } = ele.getBoundingClientRect()
  const mask = document.getElementsByClassName('isee-selenium-mask')
  const appendMask = (direct) => {
    const maskElement = document.createElement('div')
    let style = `position: absolute;background: none;z-index:998;`
    switch (direct) {
      case 'top':
        style += `width:100%;height:${top};top:0;left:0;`
        break
      case 'left':
        style += `width:${left};height:${height};top:${top};left:0;`
        break
      case 'bottom':
        style += `width:100%;height:${bottom};top:${top + height};left:0;`
        break
      case 'right':
        style += `width:${right};height:${height};top:${top};left:${left + width};`
        break
    }
    maskElement.setAttribute('style', style)
    maskElement.setAttribute('class', 'isee-selenium-mask')
    document.body.appendChild(maskElement)
  }
  if (config) {
    if (mask && mask.length) {
      return true
    }
    ['top', 'left', 'bottom', 'right'].forEach(item => {
      appendMask(item)
    })
  } else {
    if (!mask || !mask.length) {
      return false
    }
    mask.forEach(m => {
      m.parentNode.removeChild(m)
    })
  }
}
