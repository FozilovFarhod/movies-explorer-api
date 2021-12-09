const Movie = require('../models/movie');
const Forbidden = require('../errors/Forbidden');
const NotFoundError = require('../errors/NotFoundError');
const BaqRequestError = require('../errors/BadRequestError');
const ServerError = require('../errors/ServerError');
const DuplicateFieldError = require('../errors/DuplicateFieldError');

const getSavedMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BaqRequestError('Переданы некорректные данные для поиска сохраненных фильмов'));
      }
      return next(new ServerError());
    });
};

const addMovieToSaved = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const movieData = {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  };
  Movie.create(movieData)
    .then((savedMovie) => {
      res.status(201).send(savedMovie);
    })
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new DuplicateFieldError('Фильм с таким movieId уже добавлен'));
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BaqRequestError('Ошибка запроса при добавлении фильма'));
      }
      next(err);
    });
};

const removeMovieFromSaved = (req, res, next) => {
  const { movieId } = req.params;
  Movie.findById(movieId)
    .orFail(() => {
      const error = new NotFoundError('Фильм с заданным id не найден');
      error.name = 'movieNotFound';
      throw error;
    })
    .then((movie) => {
      const movieOwnerId = movie.owner.toString();
      const currentUserId = req.user._id;
      if (movieOwnerId === currentUserId) {
        return movie.remove()
          .then(() => {
            res.send({ message: 'Фильм удален из списка' });
          });
      }
      const error = new Forbidden('Только владелец списка может удалять этот фильм');
      error.name = 'notOwner';
      throw error;
    })
    .catch((error) => {
      if (error.name === 'movieNotFound' || error.name === 'notOwner') {
        next(error);
      } else if (error.name === 'CastError') {
        next(new BaqRequestError('Переданы некорректные данные для удаления карточки'));
      } else {
        next(new ServerError());
      }
    });
};

module.exports = { getSavedMovies, addMovieToSaved, removeMovieFromSaved };
