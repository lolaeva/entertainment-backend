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

module.exports = usersRouter
