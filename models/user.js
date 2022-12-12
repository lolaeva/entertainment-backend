const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bookmarkedShows: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
    },
  ],
})

module.exports = mongoose.model('User', schema)
