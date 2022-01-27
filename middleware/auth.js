const jwt = require("jsonwebtoken");
const AuthorizationError = require("../errors/authorization-err");

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    const err = new AuthorizationError("Authorization required");
    next(err);
  } else {
    const token = authorization.replace("Bearer ", "");
    let payload;
    try {
      payload = jwt.verify(
        token,
        NODE_ENV === "production" ? JWT_SECRET : "dev-secret"
      );
      req.user = payload;
      next();
    } catch (e) {
      const err = new AuthorizationError("Authorization required");
      next(err);
    }
  }
};
