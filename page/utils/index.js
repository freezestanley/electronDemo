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
  const { top, left, right, width, height, bottom } = ele.getBoundingClientRect()
  const mask = document.getElementsByClassName('isee-selenium-mask')
  // const getTranslate = (element) => {
  //   var transformMatrix = element.style['WebkitTransform'] || getComputedStyle(element, '').getPropertyValue('-webkit-transform') || element.style['transform'] || getComputedStyle(element, '').getPropertyValue('transform')

  //   var matrix = transformMatrix.match(/-?[0-9]+\.?[0-9]*/g)
  //   if (!matrix) {
  //     return [0, 0]
  //   }
  //   var x = parseInt(matrix[1] || matrix[4] || 0) // translate x
  //   var y = parseInt(matrix[2] || matrix[5] || 0) // translate y
  //   return [x, y]
  // }
  // const getElementTop = (e) => {
  //   var top = e.offsetTop
  //   var cur = e.offsetParent
  //   while (cur) {
  //     var translate = getTranslate(cur)
  //     top += (cur.offsetTop + translate[1])
  //     cur = cur.offsetParent
  //   }
  //   return top
  // }
  // const top = getElementTop(ele)
  // const bodyHeight = document.body.scrollHeight
  const appendMask = (direct) => {
    const maskElement = document.createElement('div')
    let style = `position: fixed;background: none;z-index:998;`
    switch (direct) {
      case 'top':
        style += `width:100%;height:${top}px;top:0;left:0;`
        break
      case 'left':
        style += `width:${left}px;height:${height}px;top:${top}px;left:0;`
        break
      case 'bottom':
        style += `width:100%;height:${bottom}px;top:${top + height}px;left:0;`
        break
      case 'right':
        style += `width:${right}px;height:${height}px;top:${top}px;left:${left + width}px;`
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
    [...mask].forEach(m => {
      m.parentNode.removeChild(m)
    })
  }
}

export const text2Img = (text, fontsize, fontcolor) => {
  var canvas = document.createElement('canvas')
  // 小于32字加1  小于60字加2  小于80字加4    小于100字加6
  let $buHeight = 0
  if (fontsize <= 32) { $buHeight = 1 } else if (fontsize > 32 && fontsize <= 60) { $buHeight = 2 } else if (fontsize > 60 && fontsize <= 80) { $buHeight = 4 } else if (fontsize > 80 && fontsize <= 100) { $buHeight = 6 } else if (fontsize > 100) { $buHeight = 10 }
  // 对于g j 等有时会有遮挡，这里增加一些高度
  canvas.height = fontsize + $buHeight
  var context = canvas.getContext('2d')
  canvas.width = context.measureText(text).width
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = fontcolor
  context.font = fontsize + 'px Arial'
  context.textBaseline = 'middle'
  context.fillText(text, 0, fontsize / 2)

  var dataUrl = canvas.toDataURL('image/png')// 注意这里背景透明的话，需要使用png
  return dataUrl
}

export const setWatermark = (content, style) => {
  if (!content) {
    console.warn('请传入水印内容')
  }
  const element = document.createElement('div')
  element.innerHTML = content
  const orginStyle = `position: fixed;background: none; z-index:998; top:10px; left:10px; font-size:26px; opacity: 0.5; pointer-events: none;`
  element.setAttribute('style', style || orginStyle)
  const findTag = document.getElementsByTagName('iseewrap')
  let wrap = null
  if (findTag.length) {
    wrap = findTag[0]
  } else {
    wrap = document.createElement('iseewrap')
    document.body.appendChild(wrap)
  }
  wrap.innerHTML = element.outerHTML
}
