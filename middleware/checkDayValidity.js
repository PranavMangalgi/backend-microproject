const User = require("../models/user");

const dayListValidity = async (req, res, next) => {
  try {
    const { weeklistIndex } = req.body;
    const { _id } = req.user;
    const currentUser = await User.findOne({ _id }).populate({
      path: "weeklists",
    });

    if (req.path === "/createtask") {
      const { task } = req.body;
      if (!weeklistIndex || !task) {
        res.json({
          status: "FAILED",
          message: "one or more fields are missing",
        });
      }
    }

    if (req.path === "/updatetask") {
      const { taskIndex, newDesc } = req.body;
      if (!weeklistIndex || !taskIndex || !newDesc) {
        res.json({
          status: "FAILED",
          message: "one or more fields are missing",
        });
      }
    }

    if (req.path === "/deletetask") {
      const { taskIndex, weeklistIndex } = req.body;
      if (!weeklistIndex || !taskIndex) {
        res.json({
          status: "FAILED",
          message: "one or more fields are missing",
        });
      }
    }

    if (req.path === "/mark") {
      const { taskIndex } = req.body;
      if (currentUser.weeklists[weeklistIndex].tasks[taskIndex].marked) {
        return res.json({ status: "FAILED", message: "already marked" });
      }
    }

    const currentUserDate = new Date(
      currentUser.weeklists[weeklistIndex].createdAt
    ).getTime();

    const oneDay = 24 * 60 * 60 * 1000;

    const time = new Date().getTime();

    if (currentUserDate + oneDay > time) {
      next();
    } else {
      return res.json({
        status: "FAILED",
        message: "weeklists is older than a day can't update",
      });
    }
  } catch (e) {
    res.json({ status: "FAILED last mid", message: e.message });
  }
};

module.exports = dayListValidity;
