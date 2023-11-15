const express = require("express");

const router = express.Router();

const {
  handleGenerateNewShortURL,
  handleGenerateAnalytics,
} = require("../controller/url");

router.post("/", handleGenerateNewShortURL);

module.exports = router;
