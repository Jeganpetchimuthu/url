const express = require("express");

const Login = require("../models/user");

const mongoose = require("mongoose");

const router = express.Router();

const joi = require("@hapi/joi");

const nodemailer = require("nodemailer");

const bcrypt = require("bcrypt");

const verifyToken = require("../auth/index");

const generateToken = require("../utils/index");

const loginSchema = joi.object({
  first_name: joi.string().min(3).required(),
  last_name: joi.string().min(3).required(),
  email: joi.string().min(3).required().email(),
  password: joi.string().min(3).required(),
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await Login.findOne({ email });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Login({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(200).json({ message: "user create successfully!!!" });
  }
  res.status(400).json({ message: "user already Exist" });
});

//CREATE A NEW TOKEN

router.post("/auth", async (req, res) => {
  const { password, email } = req.body;

  const user = await Login.findOne({ email });
  if (!user) {
    res.status(400).json({ message: "user not found" });
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(400).json({ message: "Incorrect password" });
  }
  const token = generateToken(user);

  res.json({ token });
});

//TOKEN VERIFY

router.get("/token", verifyToken, (req, res) => {
  res.json({ message: `welcom,${req.user.email}! This is protected data` });
});

//GENEATE RESET PASSWORD TOKEN
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  const user = await Login.findOne({ email });

  if (!user) {
    res.status(400).json({ message: "User Not Found" });
  }
  const token = Math.random().toString(36).slice(-8);

  user.resetPasswordToken = token;

  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();

  const sender = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jeganpetchimuthu1996@gmail.com",
      pass: "vugmahbnxlzxptgr",
    },
  });
  const composemail = {
    from: "jeganpetchimuthu1996@gmail.com",
    to: "ajjacksparrow1998@gmail.com ,jjegan120@gmail.com",
    subject: "password reset requiest",
    text: `you are receiving the mail has to change your password use to ${user} change youre current password`,
  };
  sender.sendMail(composemail, (error, info) => {
    if (error) {
      res.status(400).json({ message: "something went wrong, try again " });
    }
    res.status(200).json({ message: "Email Send" });
  });
});

//RESET YOUR PASSWORD

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await Login.findone({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid Token" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  res.json({ message: "Password reset succesfully" });
});

module.exports = router;
