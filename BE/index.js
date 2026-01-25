require("dotenv").config();
const express = require("express");
const AuthRouter = require("./modules/auth");
const app = express();

app.use("/api/auth", AuthRouter);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
