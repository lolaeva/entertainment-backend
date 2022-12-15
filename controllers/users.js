const usersRouter = require('express').Router()

const Show = require('../models/show')
const User = require('../models/user')

usersRouter.get('/', (request, response) => {
  User.find({}, { email: 1, bookmarkedShows: 1 })
    .populate('bookmarkedShows')
    .then((users) => {
      response.json(users)
    })
    .catch((error) => next(error))
})

usersRouter.get('/:id', (request, response) => {
  User.findById(request.params.id, { email: 1, bookmarkedShows: 1 })
    .populate('bookmarkedShows')
    .then((users) => {
      response.json(users)
    })
    .catch((error) => next(error))
})

// Set Bookmarked
usersRouter.put('/:id', async (request, response) => {
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
    let showObjects = await Promise.all(
      user.bookmarkedShows.map(async (id) => await Show.findById(id))
    )
    const showExists = showObjects.find((s) => s.title === show.title)

    // if show doesn't exist, add; else remove it from list
    if (showExists && showExists.title) {
      showObjects = showObjects.filter((s) => {
        return s.title !== show.title
      })
    } else {
      showObjects = showObjects.concat(show)
    }

    let showIds = showObjects.map((s) => s._id)

    // update user by setting bookmarkedShows
    const updatedUser = await User.findByIdAndUpdate(
      request.params.id,
      { $set: { bookmarkedShows: showIds } },
      { new: true }
    )
    response.json(updatedUser.bookmarkedShows)
  } catch (error) {
    return response.status(401).json({ error: error })
  }
})

module.exports = usersRouter
