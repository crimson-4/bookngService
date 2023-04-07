const mongoose = require("mongoose");
const validator = require("validator");
const ongoingSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: "Driver",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  isOngoing: {
    type: Boolean,
    default: true,
  },
});

const Ongoing = mongoose.model("Ongoing", ongoingSchema);
module.exports = Ongoing;
