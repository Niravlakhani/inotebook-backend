const express = require("express");
const User = require("../models/User");
const useMiddleware = require("../middleware/middleware");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const JWT_SECRET = "LakhaniFamily!";

// ROUTE 1: create a user using: POST "/api/auth/create-user". no required authentication
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
          console.log("user", user._id);
          const userInfo = {
            user: {
              id: user.id,
            },
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

// ROUTE 2: Authenticate User : POST "api/auth/login". no required authentication

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],
  async (req, res) => {
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
      return res.status(400).json({ errors: validate.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      console.log("user", user);
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const verifyPassword = await bcrypt.compare(password, user.password);
      if (!verifyPassword) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(payload, JWT_SECRET);
      return res.send({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 3: Get login user details using : POST "/api/auth/user" Login required

router.post("/user-info", useMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await User.findById(userId).select("-password");
    res.send(userData);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
