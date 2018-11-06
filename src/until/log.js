'use strict'

const log4js = require('log4js')

log4js.configure({
  appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
  categories: { default: { appenders: ['cheese'], level: 'debug' } }
})

const logger = log4js.getLogger(__dirname + '/log/log'+ (new Date().getTime()))

module.exports = logger