var express = require("express");
var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var Promise = require("bluebird");

// Define routers
var indexRouter = require("./routes/index");
var rowsRouter = require("./routes/rows");

var app = express();

// Set up mongoose connection
var mongoose = require("mongoose");

// Reading env variables (config example from https://github.com/sclorg/nodejs-ex/blob/master/server.js)
// var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
//  mongoURLLabel = "";

// Connecting to DB
var mongoURL =
  "mongodb+srv://dbUser672:Nasseseta@cluster0.6ecyv.mongodb.net/demodb?retryWrites=true&w=majority";
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Use the routes
app.use("/", indexRouter);
app.use("/rows", rowsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// var listener = app.listen(8080, function() {
//   console.log("Listening on port " + listener.address().port);
// });

module.exports = app;
