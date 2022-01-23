// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const { NODE_ENV, JWT_SECRET } = process.env;
const Article = require("../models/article");
const ServerError = require("../errors/server-err");
const NotFoundError = require("../errors/not-found-err");
const IncorrectDataError = require("../errors/incorrect-data-err");
const NoPermissionError = require("../errors/no-permission-err");

module.exports.getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    // .sort([["createdAt", -1]]) // not sure I want sorting;
    .then((articles) => res.status(200).send({ data: articles }))
    .catch((err) => {
      next(err);
    });
};

module.exports.addArticle = (req, res, next) => {
  const { keyword, title, text, date, source, link, image } = req.body;
  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: req.user._id,
  })
    .then((article) => res.status(200).send({ data: article }))
    .catch((e) => {
      let err;
      if (e.name === "ValidationError") {
        err = new IncorrectDataError("The data you sent is incorrect");
      } else {
        err = new ServerError("There was a problem with the server");
      }
      next(err);
    });
};

module.exports.deleteArticle = (req, res, next) => {
  if (req.body.owner === req.user._id) {
    Article.findByIdAndRemove(req.params.articleId)
      .then((article) => {
        if (!article) {
          next(new NotFoundError("Article with the given id was not found"));
        }
        res.status(200).send({ data: article });
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
  } else {
    const err = new NoPermissionError("You do not have permission to do that");
    next(err);
  }
};
