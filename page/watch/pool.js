class Pool {
  constructor () {
    this.pool = []
    this.packNum = 10
  }
  add (obj) {
    this.pool.push(obj)
  }
  splice () {
    return this.pool.splice(0, this.packNum)
  }
  getPackage () {
    var result = {}
    result.data = this.splice()
    return result
  }
}
export default Pool
