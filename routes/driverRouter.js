const express = require("express");
const authController = require("../controller/authController");
const driverController = require("../controller/driverController");
const driverRouter = express.Router();

driverRouter.get("/", authController.protect, driverController.getAllDriver);
driverRouter.post("/signupDriver", authController.signupDriver);
driverRouter.get(
  "/driver-within/:distance/center/:latlng",
  authController.protect,
  authController.getDriverWithin
);
driverRouter.get(
  "/updatelocation",
  authController.protect,
  driverController.updateDriverLocation
);

driverRouter.get(
  "/:id",
  authController.protect,
  driverController.getOneDriverandBook
);

module.exports = driverRouter;
