const express = require("express");
const {
  forgetPassword,
  resetPassword,
  changePassword
} = require("./forgetPassword.controller");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Add leading slash to routes
router.post("/forgetPassword", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
