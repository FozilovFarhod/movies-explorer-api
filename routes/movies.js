const moviesRouter = require('express').Router();
const { getSavedMovies, addMovieToSaved, removeMovieFromSaved } = require('../controllers/movies');

const { validateMovieData } = require('../middlewares/validation');

moviesRouter.get('/', getSavedMovies);
moviesRouter.post('/', validateMovieData, addMovieToSaved);
moviesRouter.delete('/:movieId', removeMovieFromSaved);

module.exports = moviesRouter;
