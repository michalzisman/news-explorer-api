const articleRouter = require("express").Router();
const { celebrate, Joi, errors } = require("celebrate");
const object = require("mongoose").Types.ObjectId;
const {
  getArticles,
  addArticle,
  deleteArticle,
} = require("../controllers/articles");

const validateObjId = celebrate({
  params: Joi.object().keys({
    articleId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (object.isValid(value)) {
          return value;
        }
        return helpers.message("Article with the given id was not found");
      }),
  }),
});

articleRouter.get("/articles", getArticles);
articleRouter.delete("/articles/:articleId", validateObjId, deleteArticle);
articleRouter.post(
  "/articles",
  celebrate({
    body: Joi.object().keys({
      keyword: Joi.string().required(),
      title: Joi.string().required(),
      text: Joi.string().required(),
      date: Joi.string().required(),
      source: Joi.string().required(),
      link: Joi.string().required(),
      image: Joi.string().required(),
    }),
  }),
  addArticle
);

errors();

module.exports = articleRouter;
