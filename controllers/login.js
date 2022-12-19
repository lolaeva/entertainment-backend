const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Show = require('../models/show')
const User = require('../models/user')

// Login
loginRouter.post('/', async (request, response) => {
  const { email, password } = request.body
  try {
    const user = await User.findOne({ email })
    const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.password)
  
    if (!(user && passwordCorrect)) {
      return response.status(401).json({ error: 'invalid username or password' })
    }
  
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.SECRET, {
      expiresIn: 60 * 60 * 24,
    })
  
    response.status(200).send({ token, email: user.email })
  } catch(error) {
    response.status(401).send({ error })
  }
})

module.exports = loginRouter