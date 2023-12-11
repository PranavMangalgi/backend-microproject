const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, age, gender, mobile } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.json({
        status: "FAILED",
        message: "email id exists already, go to login",
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: encryptedPassword,
      age,
      gender,
      mobile,
    });

    newUser
      .save()
      .then(() => res.json({ status: "SUCCESS", message: "user created!" }))
      .catch((e) => res.json({ status: "FAILED", message: e.message }));
  } catch (e) {
    res.json({ status: "FAILED", message: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const isPassword = bcrypt.compare(password, user.password);
      if (isPassword) {
        const token = jwt.sign(user.toJSON(), process.env.JWT_KEY, {
          expiresIn: "3d",
        });

        res.json({ status: "SUCESS", message: "you've logged in", token });
      } else {
        return res.json({ status: "FAILED", message: "password not entered" });
      }
    } else {
      return res.json({ status: "FAILED", message: "user does not exist" });
    }
  } catch (e) {
    res.json({ status: "FAILED", message: e.message });
  }
});

module.exports = router;
