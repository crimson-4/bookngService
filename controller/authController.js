const express = require("express");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const Driver = require("../models/driverModel");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRESS_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)
    ),
    secure: false,
    httpOnly: true,
  };
  console.log(process.env.JWT_COOKIE_EXPIRES_IN);
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      location: req.body.location,
      driverAssign: req.body.driverAssign,
    });
    createSendToken(newUser, 201, res);
  } catch (err) {
    next(new AppError(err.message, err.statusCode));
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new AppError("Please provide email and password", 400));
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password)))
      return next(new AppError("Incorrect email or password", 401));
    createSendToken(user, 200, res);
  } catch (err) {
    next(new AppError(err.message, err.statusCode));
  }
};
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = async (req, res, next) => {
  //1) Getting token and check if it's exists
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      // console.log("ye h token authorization se", token);
    } else if (req.cookies.jwt) token = req.cookies.jwt;
    // console.log("ye h token cookie se", token);
    if (!token)
      return next(
        new AppError("You are not logged int! Please log in to get access", 401)
      );
    //2)Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //console.log(decoded);
    //3) Check if user still Exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(
        new AppError("The user belonging to this token does no longer exist,"),
        401
      );
    }
    //4) Check if user changed password after the token was issued

    //Grant access to protected route
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.signupDriver = async (req, res, next) => {
  try {
    const newDriver = await Driver.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      location: req.body.location,
    });
    res.status(200).json({
      newDriver,
      status: "sucess",
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
      status: "fail",
    });
  }
};

exports.getDriverWithin = async (req, res, next) => {
  try {
    const { distance, latlng } = req.params;
    const [lat, lng] = latlng.split(",");
    const radius = distance / 6378.1;
    if (!lat || !lng) {
      next(
        new AppError(
          "Please provide latitude and longitude in the format lat,lng.",
          404
        )
      );
    }
    console.log(req.user);

    const drivers = await Driver.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
      isBooked: false,
    });
    // console.log(distance, lat, lng, unit);
    res.status(200).json({
      status: "success,",
      results: drivers.length,
      data: {
        data: drivers,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
