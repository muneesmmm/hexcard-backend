const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  phone: String,
  location: String,
  designation: String,
  insta: String,
  facebook: String,
  linkedin: String,
  about: String,
  password: String,
  avatar: {
    type: String,
    default: "default-avatar.png", // Set a default avatar file name if desired
  },
  paymentStatus: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
