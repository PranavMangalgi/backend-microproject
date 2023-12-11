const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const { token } = req.headers;
    const user = jwt.verify(token, process.env.JWT_KEY);
    req.user = user;
    next();
  } catch (e) {
    res.json({ status: "FAILED0", message: e.message });
  }
};

module.exports = authenticate;
