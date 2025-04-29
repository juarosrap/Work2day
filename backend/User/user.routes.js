const express = require("express");
const {
  forgetPassword,
  resetPassword,
} = require("./forgetPassword.controller");

const router = express.Router();

// Add leading slash to routes
router.post("/api/forgetPassword", forgetPassword);
router.post("/api/reset-password/:token", resetPassword);

module.exports = router;
