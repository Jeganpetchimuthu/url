const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT;
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, { useNewUrlParser: true });

const con = mongoose.connection;

const app = express();

app.use(cors({ origin: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

try {
  con.on("open", () => {
    console.log("mongoDB connected!!!");
  });
} catch (error) {
  console.log("Error: " + error);
}

const urlRouter = require("./routes/url");
app.use("/url", urlRouter);

const userRouter = require("./routes/index");
app.use("/api", userRouter);

app.get("/", (req, res) => {
  res.send("welcome");
});

app.listen(PORT, () => {
  console.log(`The node application is running on  ${PORT}`);
});
