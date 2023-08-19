const express = require("express");
const User = require("../models/User");
const router = express.Router();

// create a user using: POST "/api/auth". no required authentication
router.post("/", (req, res) => {
  console.log("req.body", req.body);
  const user = User(req.body);
  const result = user.save();
  res.json(result);
});

module.exports = router;
