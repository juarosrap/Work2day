const express = require("express");
const {
  forgetPassword,
  resetPassword,
  changePassword,
} = require("./forgetPassword.controller.js");


const {verifyToken} = require("../middleware/auth");

const router = express.Router();


router.post("/forgetPassword", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", verifyToken, changePassword);

module.exports = router;
