const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  token: { type: Array },
  isverified: { type: Boolean },
  otp: { type: Number },
  dp: { type: String },
  profileData: { type: Object },
});

const User = mongoose.model("user_signup_info", userSchema);

module.exports = User;
