const jwt = require("jsonwebtoken");

generateToken = (user) => jwt.sign({ Id: user.Id }, process.env.SECRET_KEY);

module.exports = generateToken;
