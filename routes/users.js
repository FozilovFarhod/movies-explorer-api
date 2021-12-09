const userRouter = require('express').Router();
const { getCurrentUser, updateUser } = require('../controllers/users');

userRouter.get('/me', getCurrentUser);
userRouter.patch('/me', updateUser);
module.exports = userRouter;
