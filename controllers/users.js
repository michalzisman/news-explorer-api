const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const ServerError = require("../errors/server-err");
const NotFoundError = require("../errors/not-found-err");
const IncorrectDataError = require("../errors/incorrect-data-err");
const AleadyExistsError = require("../errors/already-exists-err");

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError("User with the given id was not found"));
      }
      res.send({ data: user });
    })
    .catch((e) => {
      let err;
      if (e.name === "CastError") {
        err = new IncorrectDataError(
          "The data you sent has an incorrect format"
        );
      } else {
        err = new ServerError("There was a problem with the server");
      }
      next(err);
    });
};

module.exports.signup = (req, res, next) => {
  const { name, email, password } = req.body;
  User.findOne({ email }).then((result) => {
    if (result) {
      next(new AleadyExistsError("Email is already registered"));
    } else {
      bcrypt
        .hash(password, 10)
        .then((hash) => User.create({ name, email, password: hash }))
        .then((user) => {
          const { name, email } = user;
          res.status(200).send({ name, email });
        })
        .catch((e) => {
          let err;
          if (e.name === "ValidationError") {
            err = new IncorrectDataError("The data you sent is incorrect");
          } else {
            err = new ServerError("There was a problem with the server");
          }
          next(err);
        });
    }
  });
};

module.exports.signin = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign(
          { _id: user._id },
          NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
          {
            expiresIn: "7d",
          }
        ),
      });
    })
    .catch((e) => {
      let err;
      if (e.message === "Incorrect email or password") {
        err = new IncorrectDataError(e.message);
      } else {
        err = new ServerError("There was a problem with the server");
      }
      next(err);
    });
};
