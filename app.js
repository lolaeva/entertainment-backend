const config = require('./utils/config')
const express = require('express')
const cors = require('cors')

const app = express()

const showsRouter = require('./controllers/shows')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const signupRouter = require('./controllers/signup')

const middleware = require('./utils/middleware')
const mongoose = require('mongoose')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const url = config.MONGODB_URI
console.log('connecting to', url)

mongoose
  .connect(url)
  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(requestLogger)

app.use('/shows', middleware.authorization, showsRouter)
app.use('/users', middleware.authorization, usersRouter)
app.use('/login', loginRouter)
app.use('/signup', signupRouter)

module.exports = app
