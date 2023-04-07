const express = require("express");
const Driver = require("../models/driverModel");
const AppError = require("../utils/AppError");
const IsOngoing = require("../models/ongoingModel.");
exports.getAllDriver = async (req, res, next) => {
  try {
    const driver = await Driver.find();
    //console.log(trains);
    res.status(200).json({
      status: "success",
      length: driver.length,
      data: {
        driver,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getOneDriverandBook = async (req, res, next) => {
  try {
    let query = await Driver.findById(req.params.id);

    //console.log(popOptions);

    if (!query) {
      return next(new AppError("No document found with that Id", 404));
    }
    // console.log("dono id", req.params.id, req.user);
    const ongoingTravel = await IsOngoing.create({
      driver: req.params.id,
      user: req.user._id,
    });
    query.isBooked = true;
    await query.save({ validateBeforeSave: false });

    //console.log(ongoingTravel);
    res.status(200).json({
      status: "success",
      data: { query },
    });
  } catch (err) {
    res.status(200).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateDriverLocation = async (req, res, next) => {
  try {
    console.log(req.user._id);
    const currentTravel = await IsOngoing.find({ user: req.user._id });
    let theRandomNumber = Math.random() / 4;
    const currentDriver = await Driver.find(currentTravel[0].driver);
    console.log(theRandomNumber, currentDriver[0].location);
    let lng = (currentDriver[0].location.coordinates[0] += theRandomNumber);
    let lat = (currentDriver[0].location.coordinates[1] += theRandomNumber);
    await Driver.findByIdAndUpdate(currentDriver, { locations });

    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
    });
  }
};
