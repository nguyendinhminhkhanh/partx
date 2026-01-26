require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const AuthRouter = require("./modules/auth");
const app = express();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  app.use(express.json());
  app.use("/api/auth", AuthRouter);

  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}

main();
