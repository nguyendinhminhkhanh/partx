const express = require("express");
const Auth = require("./auth.controler");
const validateInput = require("../../common/middlewares/validateInput");
const authValid = require("./auth.validation");
const router = express.Router();

router.post("/login", Auth.login);
router.post(
  "/register",
  validateInput(authValid.registerSchema, "body"),
  Auth.register,
);

module.exports = router;
