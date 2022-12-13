const signupRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

// Sign up
signupRouter.post('/', async (request, response) => {
  const { email, password } = request.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return response.status(400).json({
      error: 'User with this email exist',
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    email: email,
    password: passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = signupRouter