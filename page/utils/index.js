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
  return !(l1.x > r2.x || l2.x > r1.x || l1.y > r2.y || l2.y > r1.y)
}
