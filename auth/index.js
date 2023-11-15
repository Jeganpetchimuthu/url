const jwt = require("jsonwebtoken");

const User = require("../models/user");

verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "missing token" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET_KEY, async (error, decode) => {
    if (error) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    const user = await User.findOne({ _id: decode.id });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    req.user = user;
    next();
  });
};
module.exports = verifyToken;
