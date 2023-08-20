const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const JWT_SECRET = "LakhaniFamily!";

// create a user using: POST "/api/auth/create-user". no required authentication
router.post(
  "/create-user",
  [
    body("name", "Enter a validate name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // if there are error , return Bad request and the error
    const validate = validationResult(req);
    if (validate.isEmpty()) {
      // salt for encrypt password
      const salt = await bcrypt.genSalt(10);
      // encrypt password

      const password = await bcrypt.hash(req.body.password, salt);
      User.create({
        name: req.body.name,
        email: req.body.email,
        password: password,
      })
        .then((user) => {
          const userInfo = {
            name: req.body.name,
            email: req.body.email,
            password: password,
          };
          const token = jwt.sign(userInfo, JWT_SECRET);
          res.send({ token });
        })
        .catch((error) => {
          if (error.code === 11000) {
            // Duplicate key error (email already exists)
            res.status(400).json({
              message: "Sorry a user with this email already exist",
              error,
            });
          } else {
            res.status(500).json({ message: "Internal server error", error });
          }
        });
    } else {
      // send response
      res.send({ errors: validate.array() });
    }
  }
);

module.exports = router;
