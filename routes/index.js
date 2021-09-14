const router = require('express').Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { validateUserBody, validateAuthData } = require('../middlewares/validation');
const userRouter = require('./users');
const moviesRouter = require('./movies');
const auth = require('../middlewares/auth');
const { login, logOut, createUser } = require('../controllers/users');

router.use(bodyParser.json());
router.use(cookieParser());

router.post('/signup', validateUserBody, createUser);
router.post('/signIn', validateAuthData, login);
router.use(auth);
router.post('/signout', logOut);
router.use('/users', userRouter);
router.use('/movies', moviesRouter);

module.exports = router;
