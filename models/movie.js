const mongoose = require('mongoose');
const isURL = require('../utils/regexps');

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator: (value) => isURL(value),
      message: 'Некорректный URL картинки',
    },
  },
  trailer: {
    type: String,
    required: true,
    validate: {
      validator: (value) => isURL(value),
      message: 'Некорректный URL трейлера',
    },
  },
  thumbnail: {
    type: String,
    required: true,
    validate: {
      validator: (value) => isURL(value),
      message: 'Некорректный URL иконки',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('movie', movieSchema);
