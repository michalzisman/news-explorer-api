const Article = require("../models/article");
const ServerError = require("../errors/server-err");
const NotFoundError = require("../errors/not-found-err");
const IncorrectDataError = require("../errors/incorrect-data-err");
const NoPermissionError = require("../errors/no-permission-err");

module.exports.getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
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

module.exports.deleteArticle = async (req, res, next) => {
  const articleExists = await Article.findOne({
    _id: req.params.articleId,
  });
  if (!articleExists) {
    next(new NotFoundError("Article with the given id was not found"));
  } else {
    const ownerMatch = await Article.findOne({
      _id: req.params.articleId,
      owner: req.user._id,
    });
    if (!ownerMatch) {
      next(new NoPermissionError("You do not have permission to do that"));
    } else {
      Article.findByIdAndRemove(req.params.articleId)
        .then((article) => res.status(200).send({ data: article }))
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
    }
  }
};
