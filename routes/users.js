const usersRouter = require("express").Router();
const { celebrate, Joi, errors } = require("celebrate");
const { getUser, signup, signin } = require("../controllers/users");

usersRouter.get("/users/me", getUser);
usersRouter.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  signup
);
usersRouter.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  signin
);

errors();

module.exports = usersRouter;
