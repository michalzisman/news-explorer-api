const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const auth = require("./middleware/auth");
const router = require("./routes/router");
const { requestLogger, errorLogger } = require("./middleware/logger");
const usersRouter = require("./routes/users");
const articleRouter = require("./routes/articles");

const { PORT = 3000 } = process.env;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.options("*", cors());
mongoose.connect("mongodb://localhost:27017/finalproject");
app.use(helmet());
app.use(requestLogger);

app.post("/signup", usersRouter);
app.post("/signin", usersRouter);

app.use(auth); // always put after signup and signin and above all routes that need authorization
app.get("/users/me", usersRouter);
app.get("/articles", articleRouter);
app.post("/articles", articleRouter);
app.delete("/articles/:articleId", articleRouter);
app.get("*", router);
app.use(errorLogger);
// app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? "An error occurred on the server" : message,
  });
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
