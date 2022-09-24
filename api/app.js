var createError = require("http-errors");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var ini = require("ini");
var fs = require("fs");

// Import INI file from project root
const config = ini.parse(
  fs.readFileSync(__dirname + "/../config.ini", "utf8")
);

// Define path routers
var apiRouter = require("./routes/api");

// Create app
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Init mongoDB
var dbUrl = `mongodb://${config.db.IP_ADDRESS}:${config.db.PORT}/${config.db.DB_NAME}`;

mongoose.connect(
  dbUrl,
  // to fix deprecation warnings
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "mongoDB connection error:"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors()); // Enable all CORS exemption for all routes
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
