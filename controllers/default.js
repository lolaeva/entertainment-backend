const defaultRouter = require('express').Router()

defaultRouter.get('/', async (request, response) => {
  return response.send('<h1>This is entertainment backend app</h1>')
})

module.exports = defaultRouter
