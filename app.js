const express = require("express");
const morgan = require("morgan");
const xss = require("xss-clean");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const mongoSanitize = require("express-mongo-sanitize");
const userRouter = require("./routes/userRouter");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const driverRouter = require("./routes/driverRouter");

app.enable("trust proxy");

// Global middlewares
app.use(cors());
app.options("*", cors());
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

//1) GLOBAL MIDDLEWARES
//Serving static files
//app.use(express.static(path.join(__dirname, 'public')));

//Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/drivers", driverRouter);

module.exports = app;
