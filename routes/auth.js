const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");

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
  (req, res) => {
    // if there are error , return Bad request and the error
    const validate = validationResult(req);
    if (validate.isEmpty()) {
      User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      })
        .then((user) => res.send(user))
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
