const express = require("express");
const router = express.Router();

const Weeklist = require("../models/weeklistSchema");
const User = require("../models/user");
const authenticate = require("../middleware/authenticate");
const dayListValidity = require("../middleware/checkDayValidity");
const weeklistValidity = require("../middleware/checkWeeklistValidity");

//everything related to weeklists

router.get("/users", async (req, res) => {
  try {
    // const {_id } = req.user;

    const currentUser = await User.find({}).populate({
      path: "weeklists",
      model: "WeekList",
    });

    res.json({ status: "SUCCESS", message: currentUser });
  } catch (e) {
    res.json({ status: "FAILED", message: e.message });
  }
});

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

//create a list
router.post("/createlist", authenticate, async (req, res) => {
  try {
    const { email, _id } = req.user;
    const currentUser = await User.findOne({ email }).populate("weeklists");

    //see how many are active
    const weekListNumber = currentUser.weeklists.filter(
      (i) => i.active && !i.completed
    ).length;

    if (weekListNumber >= 2) {
      return res.json({
        status: "FAILED",
        message: "already two active or two uncompleted",
      });
    }

    const newWeekList = await Weeklist.create({ user: currentUser._id });

    currentUser.weeklists.push(newWeekList._id);
    await currentUser.save();

    res.json({ status: "SUCCESS", message: "weeklist created" });
  } catch (e) {
    res.json({ status: "FAILED", message: e.message });
  }
});

//delete a weeklist
router.delete(
  "/deletelist",
  authenticate,
  weeklistValidity,
  dayListValidity,
  async (req, res) => {
    try {
      const { weeklistIndex } = req.body;
      const { _id } = req.user;
      const currentUser = await User.findOne({ _id }).populate({
        path: "weeklists",
      });

      const userCopy = await User.findOne({ _id });

      const weeklistId = currentUser.weeklists[weeklistIndex]._id;

      const weeklistCopy = userCopy.weeklists.slice();

      const idx = weeklistCopy.findIndex((i) => i.equals(weeklistId));

      weeklistCopy.splice(idx, 1);

      await User.findByIdAndUpdate(
        userCopy._id,
        { $set: { weeklists: weeklistCopy } },
        { new: true }
      );

      Weeklist.findByIdAndDelete(weeklistId)
        .then(() =>
          res.json({ status: "SUCCESS", message: "deleted the list" })
        )
        .catch((e) =>
          res.json({ status: "FAILEDF", message: "could not delete the list" })
        );
    } catch (e) {
      res.json({ status: "FAILED", message: e.message });
    }
  }
);

//all weeklists that are yet to be completed
router.get("/incomplete-lists", authenticate, async (req, res) => {
  try {
    let weeklists = await Weeklist.find({ active: true }).lean().slice();

    weeklists
      .filter((weeklist) => weeklist.active === true)
      .forEach((weeklist) => {
        const { createdAt } = weeklist;
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const timeLeft =
          new Date(createdAt).getTime() + oneWeek - new Date().getTime();
        console.log(timeLeft);
        weeklist.timeLeft = timeLeft; //shows timeLeft in milliseconds
      });

    return weeklists
      ? res.json({ status: "SUCESS", message: weeklists })
      : res.json({ status: "FAILED", message: "no weeklists" });
  } catch (e) {
    res.json({ status: "FAILED", message: e.message });
  }
});

//fetch a user by weeklist id
router.get("/weeklist/:id", authenticate, async (req, res) => {
  try {
    const weeklists = await Weeklist.findOne({ _id: req.params.id });
    if (weeklists) {
      return res.json({ status: "SUCCESS", message: weeklists });
    } else {
      return res.json({ status: "FAILED", message: "no weeklist found" });
    }
  } catch (e) {
    res.json({ status: "FAILED", message: e.message });
  }
});

// fetch all active users - /feed api
router.get("/feed", authenticate, weeklistValidity, async (req, res) => {
  try {
    let weeklists = await Weeklist.find({ active: true });
    return weeklists
      ? res.json({ status: "SUCESS", message: weeklists })
      : res.json({ status: "FAILED", message: "no weeklists" });
  } catch (e) {
    res.json({ status: "FAILED", message: e.message });
  }
});

module.exports = router;
