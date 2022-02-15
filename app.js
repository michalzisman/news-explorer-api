const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { errors } = require("celebrate");
const helmet = require("helmet");
const cors = require("cors");
const auth = require("./middleware/auth");
const centralizedErroHandling = require("./middleware/centralizedErroHandling");
const router = require("./routes/router");
const { requestLogger, errorLogger } = require("./middleware/logger");
const usersRouter = require("./routes/users");
const articleRouter = require("./routes/articles");

const { PORT = 3000, NODE_ENV, PROD_DB } = process.env;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.options("*", cors());
mongoose.connect(
  NODE_ENV === "production" ? PROD_DB : "mongodb://localhost:27017/finalproject"
);
app.use(helmet());
app.use(requestLogger);

app.post("/signup", usersRouter);
app.post("/signin", usersRouter);

app.get("/users/me", auth, usersRouter);
app.get("/articles", auth, articleRouter);
app.post("/articles", auth, articleRouter);
app.delete("/articles/:articleId", auth, articleRouter);
app.get("*", router);
app.use(errorLogger);
app.use(errors());
app.use(centralizedErroHandling);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
