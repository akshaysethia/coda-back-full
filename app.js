var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var cors = require("cors");
var adminRouter = require("./routes/adminRoutes");
var userRouter = require("./routes/userRoutes");
var mongoose = require("mongoose");
require("dotenv").config();
require("./config/passport");

var app = express();

mongoose.connect(
  process.env.MONGO_URI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err, next) => {
    if (err) {
      next(err);
    } else {
      console.log("Connected to Mongo Database !");
    }
  }
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use("/admin", adminRouter);
app.use("/user", userRouter);

module.exports = app;
