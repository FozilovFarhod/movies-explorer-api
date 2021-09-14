const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, SECRET_KEY } = process.env;
const NotFoundError = require('../errors/NotFoundError');
const DuplicateEmailError = require('../errors/DuplicateFieldError');
const BaqRequestError = require('../errors/BadRequestError');
const ServerError = require('../errors/ServerError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const devSecretKey = 'secret-key';

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => res.send(user.toJSON()))
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new DuplicateEmailError('Пользователь с таким email уже зарегистрирован'));
      } else if (err.name === 'ValidationError') {
        next(new BaqRequestError('Переданы некорректные данные при создании пользователя'));
      }
      next(new ServerError());
    });
};
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      const error = new NotFoundError('Пользователь с данным id не найден');
      error.name = 'notFound';
      throw error;
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'notFound') {
        next(err);
      } else if (err.name === 'CastError') {
        next(new BaqRequestError('id передан в некорректном формате'));
      } else {
        next(new ServerError());
      }
    });
};

const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { email, name } = req.body;
  const objectForUpdateUserProfile = {
    email,
    name,
  };
  User.findByIdAndUpdate(userId, objectForUpdateUserProfile, { new: true, runValidators: true })
    .orFail(() => {
      const error = new NotFoundError('Пользователь с данным id не найден');
      error.name = 'notFound';
      throw error;
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new DuplicateEmailError('Пользователь с таким email уже зарегистрирован'));
      } else if (err.name === 'notFound') {
        next(err);
      } else if (err.name === 'CastError') {
        next(new BaqRequestError('id передан в некорректном формате'));
      } else if (err.name === 'ValidationError') {
        next(new BaqRequestError('Переданы некорректные данные при обновлении профиля'));
      }
      next(err);
    });
};
const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new UnauthorizedError('Введите пароль и email');
    error.name = 'noEmailOrPassword';
    next(error);
  } else {
    User.findOne({ email }).select('+password')
      .then((user) => {
        if (!user) {
          const error = new UnauthorizedError('Неправильные почта или пароль');
          error.name = 'notFound';
          throw error;
        } else {
          return bcrypt.compare(password, user.password)
            .then((matched) => {
              if (!matched) {
                const error = new UnauthorizedError('Неправильные почта или пароль');
                error.name = 'wrongEmailOrPassword';
                throw error;
              } else {
                return jwt.sign({ _id: user._id }, NODE_ENV === 'production' && SECRET_KEY ? SECRET_KEY : devSecretKey, { expiresIn: '7d' });
              }
            });
        }
      })
      .then((token) => {
        res.cookie('jwt', token, {
          httpOnly: true,
          expires: new Date(Date.now() + (60 * 24 * 3600000)),
          // sameSite: 'None',
          // secure: true,
        }).status(200).send({ message: 'Вы успешно авторизовались' });
      })
      .catch(next);
  }
};

const logOut = (req, res, next) => {
  const authToken = req.cookies.jwt;
  if (!authToken) {
    next(new UnauthorizedError('Вы не авторизованы'));
  } else {
    res.clearCookie('jwt').status(200).send({ message: 'Вы вышли из приложения' });
  }
};

module.exports = {
  getCurrentUser, updateUser, login, logOut, createUser,
};
