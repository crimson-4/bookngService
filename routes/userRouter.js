const express = require("express");
const authController = require("./../controller/authController");

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.get("/login", authController.login);
module.exports = userRouter;
