const mongoose = require("mongoose");

const tasksSchema = new mongoose.Schema({
  marked: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },
  markedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: new Date().getTime(),
    immutable: true,
  },
});

const weeklistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  heading: {
    type: String,
    unique: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  tasks: {
    type: [tasksSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("WeekList", weeklistSchema);
