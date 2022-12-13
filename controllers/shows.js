const showsRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Show = require('../models/show')
const User = require('../models/user')

showsRouter.get('/', async (request, response) => {
  try {
    let shows = await Show.find({})
    // shows = shows.map((show) => {
    //   if (user.bookmarkedShows.includes(show.id)) {
    //     console.log(show.id)
    //     show.isBookmarked = true
    //   }
    // })
    return response.json(shows)
  } catch (error) {
    return response.status(401).json({ error: error })
  }
})

module.exports = showsRouter
