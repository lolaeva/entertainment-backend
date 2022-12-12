const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()

const PORT = process.env.PORT

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static('build'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
