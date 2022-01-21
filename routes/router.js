const router = require("express").Router();
const NotFoundError = require("../errors/not-found-err");

router.get("*", (req, res, next) => {
  const err = new NotFoundError("Requested resource not found");
  next(err);
});

module.exports = router;
