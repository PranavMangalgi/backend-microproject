const express = require("express");
const router = express.Router();

const Weeklist = require("../models/weeklistSchema");
const User = require("../models/user");
const authenticate = require("../middleware/authenticate");
const dayListValidity = require("../middleware/checkDayValidity");
const weeklistValidity = require("../middleware/checkWeeklistValidity");

//displays all the lists of a particular user
router.get("/lists", authenticate, async (req, res) => {
  try {
    const { _id } = req.user;

    const currentUser = await User.findOne({ _id }).populate({
      path: "weeklists",
      // model: "WeekList",
    });

    res.json({ status: "SUCCESS", message: currentUser });
  } catch (e) {
    res.json({ status: "FAILED", message: e.message });
  }
});

//all functions related to tasks

//create task
router.patch(
  "/createtask",
  authenticate,
  weeklistValidity,
  dayListValidity,
  async (req, res) => {
    try {
      const { weeklistIndex, task } = req.body;
      const { _id } = req.user;
      const currentUser = await User.findOne({ _id }).populate({
        path: "weeklists",
      });

      const newTask = {
        description: task,
      };

      const weeklistId = currentUser.weeklists[weeklistIndex]._id;

      const weeklistCopy = currentUser.weeklists.slice();
      weeklistCopy[weeklistIndex].tasks.push(newTask);

      Weeklist.findByIdAndUpdate(
        weeklistId,
        { $set: { tasks: weeklistCopy[weeklistIndex].tasks } },
        {
          new: true,
        }
      )
        .then(() => res.json({ status: "SUCCESS", message: "created a task" }))
        .catch((e) => res.json({ status: "FAILEDF", message: e }));
    } catch (e) {
      res.json({ status: "FAILED ", message: e.message });
    }
  }
);

//update a task
router.patch(
  "/updatetask",
  authenticate,
  weeklistValidity,
  dayListValidity,
  async (req, res) => {
    try {
      const { weeklistIndex, taskIndex, newDesc } = req.body;
      const { _id } = req.user;
      const currentUser = await User.findOne({ _id }).populate({
        path: "weeklists",
        model: "WeekList",
      });

      const weeklistId = currentUser.weeklists[weeklistIndex]._id;

      const weeklistCopy = currentUser.weeklists.slice();

      weeklistCopy[weeklistIndex].tasks[taskIndex].description = newDesc;

      Weeklist.findByIdAndUpdate(
        weeklistId,
        { $set: { tasks: weeklistCopy[weeklistIndex].tasks } },
        {
          new: true,
        }
      )
        .then(() =>
          res.json({ status: "SUCCESS", message: "updated the task" })
        )
        .catch((e) =>
          res.json({ status: "FAILEDF", message: "could not update a task" })
        );
    } catch (e) {
      res.json({ status: "FAILED", message: e.message });
    }
  }
);

//delete a task
router.delete(
  "/deletetask",
  authenticate,
  weeklistValidity,
  dayListValidity,
  async (req, res) => {
    try {
      const { weeklistIndex, taskIndex } = req.body;
      const { _id } = req.user;
      const currentUser = await User.findOne({ _id }).populate({
        path: "weeklists",
        // model: "WeekList",
      });

      const weeklistId = currentUser.weeklists[weeklistIndex]._id;

      const weeklistCopy = currentUser.weeklists.slice();

      weeklistCopy[weeklistIndex].tasks.splice(
        weeklistCopy[weeklistIndex].tasks[taskIndex],
        1
      );

      Weeklist.findByIdAndUpdate(
        weeklistId,
        { $set: { tasks: weeklistCopy[weeklistIndex].tasks } },
        {
          new: true,
        }
      )
        .then(() =>
          res.json({ status: "SUCCESS", message: "deleted the task" })
        )
        .catch((e) =>
          res.json({ status: "FAILEDF", message: "could not delte the task" })
        );
    } catch (e) {
      res.json({ status: "FAILED", message: e.message });
    }
  }
);

//mark or unmark
router.patch(
  "/mark",
  authenticate,
  weeklistValidity,
  dayListValidity,
  async (req, res) => {
    try {
      const { weeklistIndex, taskIndex } = req.body;
      const { _id } = req.user;
      const currentUser = await User.findOne({ _id }).populate("weeklists");

      const weeklistCopy = currentUser.weeklists.slice();

      const id = weeklistCopy[weeklistIndex]._id;
      weeklistCopy[weeklistIndex].tasks[taskIndex].markedAt =
        new Date().toISOString();
      weeklistCopy[weeklistIndex].tasks[taskIndex].marked = true;
      await Weeklist.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            tasks: weeklistCopy[weeklistIndex].tasks,
          },
        },
        { new: true }
      );

      res.json({ status: "SUCCESS", message: "marked successfully" });
    } catch (e) {
      res.json({ status: "FAILED", message: e.message });
    }
  }
);

module.exports = router;
