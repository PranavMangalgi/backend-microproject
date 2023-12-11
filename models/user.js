const mongoose = require("mongoose");
const WeekList = require("./weeklistSchema");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["M", "F"],
  },
  mobile: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/,
  },
  weeklists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeekList",
      default: [],
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
