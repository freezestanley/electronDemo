import { debounce } from '../socket'
import { ISEE_MSG_POOL, ISEE_RESEND_MAX_COUNT, ISEE_BATCH_COUNT, ISEE_RESEND_TIME_INTERVAL, ISEE_MSG_ID } from '../constant'
import { sendErrorMsg, getMaxRepeatCount } from '../utils'

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
    this.timer = null
    this._pool = getMsgListFromLocalStorage()
    this._msgId = getMsgIdFromLocalStorage(cookie)
    this._confirmPool = []
    this.lastResentList = []
    this.resndMaxExceed = false
    this.debounceLoadDataFromLocalStorage = debounce(
      () => {
        const persistedMsgList = getMsgListFromLocalStorage()
        // pool为空时，如果localStorage中不为空，则取localStorage中的数据填充pool
        if (persistedMsgList.length > 0) {
          this.pool = persistedMsgList
        }
      },
      200,
      'debounceLoadDataFromLocalStorage'
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
  persist (list) {
    debounce(
      val => {
        localStorage.setItem(ISEE_MSG_POOL, JSON.stringify(val))
      },
      300,
      'persist'
    ).call(this, list)
  }
  addPool (val) {
    const msgList = normalizeParam(val)
    msgList.forEach(item => {
      item.id = this.msgId++
    })
    this.pool = this.pool.concat(msgList)
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
      const dataSlice = this.pool.slice(0, ISEE_BATCH_COUNT)
      this.pool = this.pool.slice(ISEE_BATCH_COUNT)
      // 放到confrim Pool中的数据添加发送时间属性
      this.confirmPool = dataSlice
        .filter(item => !includeMsg(this.confirmPool, item))
        .map(item => ({ ...item, sentTime: t }))
        .concat(this.confirmPool)
      this.sendCb(dataSlice)
      // console.log('-----call send')
    }
  }
  clearTimer () {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
  onPoolChange (list) {
    // 如果重发次数超过最大次数，停止重发动作，后续产生的事件缓存到localStorage
    if (this.resndMaxExceed) {
      this.clearTimer()
      this.persist(this.confirmPool.concat(list))
      return
    }
    if (list.length > 0) {
      if (!this.timer) {
        this.timer = setInterval(() => {
          this.doSend(Date.now())
        }, 500)
      }
    } else {
      this.debounceLoadDataFromLocalStorage()
      this.clearTimer()
    }
  }
  addIntolastResentList (list) {
    if (this.lastResentList.length > ISEE_RESEND_MAX_COUNT * ISEE_BATCH_COUNT) {
      this.lastResentList.splice(0, ISEE_BATCH_COUNT)
    }
    this.lastResentList = this.lastResentList.concat(list)
    const repeatCount = getMaxRepeatCount(this.lastResentList)
    if (repeatCount >= ISEE_RESEND_MAX_COUNT) {
      this.resndMaxExceed = true
      const errorMsg = `MsgPool:消息重发次数超过${ISEE_RESEND_MAX_COUNT}次,页面刷新前停止发送，用户新的操作消息会继续写入localStorage`
      sendErrorMsg(errorMsg)
      console.log(errorMsg)
    }
  }
  onConfirmPoolChange (list) {
    const now = Date.now()
    let reSendMsgList = []
    let pureReSendMsgList = []

    if (list.length > 0) {
      // 需要重发的消息列表
      reSendMsgList = list.filter(item => {
        const t = now - item.sentTime
        // console.log('----消息超时时间：', t)
        return t >= ISEE_RESEND_TIME_INTERVAL
      })
      pureReSendMsgList = reSendMsgList.filter(item => !includeMsg(this.pool, item))
      if (pureReSendMsgList.length > 0) {
        this.addIntolastResentList(pureReSendMsgList.map(item => item.id))
        this.pool = pureReSendMsgList.concat(this.pool)
      }
    }
    // 持久化消息
    this.persist(list.concat(this.pool.filter(item => !includeMsg(list, item))))
  }
  onMsgIdChange (val) {
    const iseebiz = this.cookie.getCookie('ISEE_BIZ')
    this.cookie.setCookie(ISEE_MSG_ID, JSON.stringify({ [iseebiz]: val }))
  }
}
