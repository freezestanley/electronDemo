'use strict'

const log4js = require('log4js')
const filename = 'src/log/cheese.log'
log4js.configure({
  appenders: { cheese: { type: 'file', filename } },
  categories: { default: { appenders: ['cheese'], level: 'debug' } }
})

const logger = log4js.getLogger(filename)

module.exports = logger
