const jwt = require('jsonwebtoken')
const User = require('../models/user')

const authorization = async (request, response, next) => {
  const authorization = request.get('authorization')

  if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
    return response.status(403).json({ error: 'A token is required for authentication' })
  }

  try {
    const decodedToken = jwt.verify(authorization.substring(7), process.env.SECRET);
    if(decodedToken) {
      request.user = await User.findById(decodedToken.id)
    }
    next()
  } catch (err) {
    return response.status(401).json({ error: 'Invalid Token' })
  }
}


module.exports = {
  authorization
}