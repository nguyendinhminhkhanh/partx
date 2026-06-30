const express = require("express");
const Auth = require("./auth.controler");
const validateInput = require("../../common/middlewares/validateInput");
const getUser = require("../../common/middlewares/getUser");
const isAuth = require("../../common/middlewares/isAuth");
const isAdmin = require("../../common/middlewares/isAdmin");
const authValid = require("./auth.validation");
const router = express.Router();

router.post("/login", Auth.login);
router.post("/register", validateInput(authValid.registerSchema, "body"), Auth.register);
router.get("/me", getUser, Auth.getUserInfor);
router.put("/update", isAuth, validateInput(authValid.updateProfileSchema, "body"), Auth.updateProfile);
router.put("/change-password", isAuth, validateInput(authValid.changePasswordSchema, "body"), Auth.changePassword);

// Quản lý tài khoản — chỉ admin
router.get("/accounts", isAuth, isAdmin, Auth.getAccounts);
router.put("/accounts/:id/status", isAuth, isAdmin, Auth.updateAccountStatus);

module.exports = router;
