const express = require("express");
const Auth = require("./auth.controler");
const router = express.Router();

router.get("/login", Auth.login);
router.get("/register", Auth.register);

module.exports = router;
