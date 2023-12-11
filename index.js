const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
dotenv.config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authRoutes = require("./routes/auth");
const weeklistRoutes = require("./routes/weeklist");
const taskRoutes = require("./routes/tasks");

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ status: "SUCCESS", message: "HELLO THERE DB & server RUNNING" });
});

app.use("/", authRoutes);
app.use("/", taskRoutes);
app.use("/", weeklistRoutes);

app.get("/health", (req, res) => {
  const data = {
    serverName: "Week List Server",
    currentTime: new Date(),
    uptime: process.uptime(),
    status: "active",
  };
  res.status(200).json(data);
});

app.use((req, res) => {
  res.status(404).json({ status: "FAILED", message: "Route not found" });
});

app.listen(port, () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() =>
      console.log(
        `DB connected successfully, server running on http://localhost:${port}`
      )
    )
    .catch((e) => console.log({ status: "FAILED", message: e.message }));
});
