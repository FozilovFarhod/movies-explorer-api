const jwt = require('jsonwebtoken');
require('dotenv').config();
const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, SECRET_KEY } = process.env;
const devSecretKey = 'secret-key';

module.exports = (req, res, next) => {
  const authToken = req.cookies.jwt;
  let payload;
  if (!authToken) {
    throw new UnauthorizedError('Вы не авторизованы');
  } else {
    try {
      payload = jwt.verify(authToken, NODE_ENV === 'production' ? SECRET_KEY : devSecretKey);
    } catch (err) {
      next((new UnauthorizedError('Токен не подходит')));
    }
    req.user = payload;
  }
  next();
};
