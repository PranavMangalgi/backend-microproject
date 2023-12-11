const Weeklist = require("../models/weeklistSchema");
const User = require("../models/user");

const weeklistValidity = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const weeklistsCollection = await Weeklist.find();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const time = new Date().getTime();
    const currentUser = await User.findOne({ _id }).populate("weeklists");

    if (req.body.weeklistIndex) {
      const { weeklistIndex } = req.body;
      if (!currentUser.weeklists[weeklistIndex]) {
        return res.json({
          status: "FAILED",
          message: "no such weeklist exists",
        });
      }

      if (
        !currentUser.weeklists[weeklistIndex].active ||
        currentUser.weeklists[weeklistIndex].completed
      ) {
        return res.json({
          status: "FAILED",
          message: "weeklist is completed",
        });
      } else {
        next();
      }
    } else {
      weeklistsCollection.forEach(async (weeklist) => {
        if (weeklist.active) {
          const { createdAt, _id } = weeklist;
          const createdAtDate = new Date(createdAt).getTime();

          if (!(createdAtDate + oneWeek > time)) {
            await Weeklist.findByIdAndUpdate(
              _id,
              { $set: { active: false } },
              { new: true }
            );
          }
        }
        if (
          weeklist.tasks.lenght > 0 &&
          weeklist.tasks.every((task) => task.marked === true)
        ) {
          await Weeklist.findByIdAndUpdate(
            _id,
            { $set: { completed: true } },
            { new: true }
          );
        }
      });
      next();
    }
  } catch (e) {
    res.json({ status: "FAILEDXX", message: e.message });
  }
};

module.exports = weeklistValidity;
