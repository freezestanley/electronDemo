const CONF = require('./conf')
const desk = require('./desk')

class Room {
  constructor(id){
    console.log('new room')
    this._id = id
    this._deskList = []
    this._state = CONF.WAITSTATE
  }
  get state () {
    return this._state
  }
  set state (st) {
    this._state = st
  }
  get id () {
    return this.id
  }
  set id (id) {
    this._id = id
  }
  get deskList () {
    return this._deskList
  }
  addDesk (desk) {
    if (this.deskList.length <= CONF.MAXDESK){
      this.deskList.push(desk)
    } else {
      console.log('room full:' + this.deskList.length + ':' + CONF.MAXDESK)
    }
  }
  findDesk (id) {
    let deskId = this.deskList.findIndex((ele) => ele.id === id)
    return this.deskList[deskId]
  }
  findWaitDesk () {
    return this.deskList.find(ele => ele.state === CONF.WAITSTATE)
  }
  removeDesk (id) {
    let deskId = this.deskList.findIndex((ele) => ele.id === id)
    if (id)
      this.deskList.splice(deskId, 1)
  }
}
module.exports = Room