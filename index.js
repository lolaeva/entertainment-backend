const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

require('dotenv').config()
const app = express()

const Show = require('./models/show')
const User = require('./models/user')

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

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose
  .connect(url)
  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const authorization = (request, response, next) => {
  const token = request.headers?.authorization?.split(' ')[1]

  if (!token) {
    return response.status(403).json({ error: 'A token is required for authentication' })
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET)
    return next()
  } catch (err) {
    return response.status(401).json({ error: 'Invalid Token' })
  }
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/shows', async (request, response) => {
  // if (currentUser.bookmarkedShows.includes(root._id)) return true
  //     else return false
  // .aggregate([
  //   {
  //     $lookup: {
  //       from: 'User'
  //     }
  //   }
  // ])

  const token = request.headers?.authorization?.split(' ')[1]

  if (!token) {
    return response.status(403).json({ error: 'A token is required for authentication' })
  }

  try {
    // check user to update bookmarked
    const decoded = jwt.verify(token, process.env.SECRET)
    const user = await User.findOne({ email: decoded.email })
    let shows = await Show.find({})

    // console.log('user.bookmarkedShows', user.bookmarkedShows);

    // shows = shows.map((show) => {
    //   if (user.bookmarkedShows.includes(show.id)) {
    //     console.log(show.id)
    //     show.isBookmarked = true
    //   }
    // })

    // console.log('shows', shows[0])

    return response.json(shows)
  } catch (error) {
    return response.status(401).json({ error: error })
  }
})

app.get('/users', authorization, (request, response) => {
  User.find({}, { email: 1, bookmarkedShows: 1 })
    .populate('bookmarkedShows')
    .then((users) => {
      response.json(users)
    })
    .catch((error) => next(error))
})

// Set Bookmarked
app.put('/user/:id', authorization, async (request, response) => {
  //Beyond Earth
  const { showId } = request.body

  const user = await User.findById(request.params.id)
  const show = await Show.findById(showId)

  if (!user) {
    return response.status(401).json({ error: 'User does not exist' })
  }
  if (!show) {
    return response.status(401).json({ error: 'Show does not exist' })
  }

  try {
    // check if show already exists in bookmarkedShows
    const mappedShows = await Promise.all(
      user.bookmarkedShows.map(async (id) => await Show.findById(id))
    )
    const showExists = mappedShows.filter((s) => (s.title === show.title ? true : false))
    const updatedBookmarkedShows =
      showExists.length === 0 ? user.bookmarkedShows.concat(show) : user.bookmarkedShows
    
      // update user by setting bookmarkedShows
    const updatedUser = await User.findByIdAndUpdate(
      request.params.id,
      { $set: { bookmarkedShows: updatedBookmarkedShows } },
      { new: true }
    )
    response.json(updatedUser)
  } catch (error) {
    return response.status(401).json({ error: error })
  }
})

// Login
app.post('/login', async (request, response) => {
  const { email, password } = request.body
  const user = await User.findOne({ email })
  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.password)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const token = jwt.sign({ email: user.email, id: user._id }, process.env.SECRET, {
    expiresIn: 60 * 60 * 24,
  })

  response.status(200).send({ token, email: user.email })
})

// Sign in
app.post("/signup", async (request, response) => {
  const { email, password } = request.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return response.status(400).json({
      error: "User with this email exist",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    email: email,
    password: passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
