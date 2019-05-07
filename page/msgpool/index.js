import { debounce } from '../socket'
import { ISEE_MSG_POOL, ISEE_BATCH_COUNT, RESEND_TIME_INTERVAL, ISEE_MSG_ID } from '../constant'

const noop = function () {}
const getType = function (obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}
const normalizeParam = function (val) {
  if (getType(val) === 'Array') {
    return val
  }
  return val ? [val] : []
}
const includeMsg = function (list, msg, isId) {
  return list.find(item => {
    const s1 = `${isId ? item : item.id}`
    const s2 = `${msg.id}`
    return s1 === s2
  })
}
const getMsgListFromLocalStorage = function () {
  return JSON.parse(localStorage.getItem(ISEE_MSG_POOL) || '[]')
}
const getMsgIdFromLocalStorage = function (cookie) {
  return JSON.parse(cookie.getCookie('ISEE_MSG_ID') || '{}')[cookie.getCookie('ISEE_BIZ')] || 0
}

export default class MsgPool {
  constructor (options) {
    const { cookie, sendCb } = options
    this.cookie = cookie
    this.sendCb = sendCb || noop
    this._pool = getMsgListFromLocalStorage()
    this._msgId = getMsgIdFromLocalStorage(cookie)
    this._confirmPool = []
    this.timer = null
    this.resendCount = 0
    this.persist = debounce(
      val => {
        localStorage.setItem(ISEE_MSG_POOL, JSON.stringify(val))
      },
      300,
      'persist'
    )
  }
  set pool (val) {
    this._pool = val
    this.onPoolChange(val)
  }
  get pool () {
    return this._pool
  }
  set confirmPool (val) {
    this._confirmPool = val
    this.onConfirmPoolChange(val)
  }
  get confirmPool () {
    return this._confirmPool
  }
  set msgId (val) {
    this._msgId = val
    this.onMsgIdChange(val)
  }
  get msgId () {
    return this._msgId
  }
  addPool (val) {
    const msgList = normalizeParam(val)
    msgList.forEach(item => {
      item.id = this.msgId++
    })
    this.pool = this._pool.concat(msgList)
  }
  addConfirmPool (val) {
    this.confirmPool = this._confirmPool.concat(normalizeParam(val))
  }
  removePool (val) {
    const toRemoveList = normalizeParam(val)
    this.pool = this._pool.filter(item => !includeMsg(toRemoveList, item))
  }
  removeConfirmPool (val) {
    const toRemoveList = normalizeParam(val)
    this.confirmPool = this._confirmPool.filter(item => !includeMsg(toRemoveList, item, true))
  }
  doSend (t) {
    if (this.pool.length > 0) {
      const dataSlice = this._pool.splice(0, ISEE_BATCH_COUNT)
      // 放到confrim Pool中的数据添加发送时间属性
      this.confirmPool = dataSlice
        .filter(item => !includeMsg(this.confirmPool, item))
        .map(item => ({ ...item, sentTime: t }))
        .concat(this.confirmPool)
      this.sendCb(dataSlice)
    }
  }
  onPoolChange (list) {
    if (list.length > 0) {
      if (!this.timer) {
        this.timer = setInterval(() => {
          this.doSend(Date.now())
        }, 500)
      }
    } else {
      const persistedMsgList = getMsgListFromLocalStorage()
      // pool为空时，如果localStorage中不为空，则取localStorage中的数据填充pool
      if (persistedMsgList.length > 0) {
        this.pool = persistedMsgList
        return
      }
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  }
  onConfirmPoolChange (list) {
    const now = Date.now()
    let reSendMsgList = []
    let remain = []
    let pureReSendMsgList = []
    if (list.length > 0) {
      // the msg list need to send again
      reSendMsgList = list.filter(item => {
        const t = now - item.sentTime
        console.log('-----t', t)
        return t >= RESEND_TIME_INTERVAL
      })
      pureReSendMsgList = reSendMsgList.filter(item => !includeMsg(this.pool, item))
      remain = list.filter(item => !includeMsg(pureReSendMsgList, item))
      if (pureReSendMsgList.length > 0) {
        this.pool = pureReSendMsgList.concat(this.pool)
      }
      if (pureReSendMsgList.length === 0 && reSendMsgList.length > 0) {
        if (this.resendCount >= 4) {
          console.log('ws消息不能正常返回')
        }
        this.resendCount++
      }
    }
    this.persist(remain.concat(this.pool))
  }
  onMsgIdChange (val) {
    const iseebiz = this.cookie.getCookie('ISEE_BIZ')
    this.cookie.setCookie(ISEE_MSG_ID, JSON.stringify({ [iseebiz]: val }))
  }
}
