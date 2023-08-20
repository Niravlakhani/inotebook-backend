const express = require("express");
const Notes = require("../models/Notes");
const useMiddleware = require("../middleware/middleware");
const { body, validationResult } = require("express-validator");
const router = express.Router();

// ROUTE 1: Get All The Notes Using : Get "/api/notes/all-notes" Login required
router.get("/all-notes", useMiddleware, async (req, res) => {
  try {
    const getAllNotesByUserId = await Notes.find({ user: req.user.id });
    res.status(200).json(getAllNotesByUserId);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

// ROUTE 2: Create The Note Using : Post "/api/notes/create-note" Login required
router.post(
  "/create-note",
  useMiddleware,
  [
    body("title", "Title must be atleast 5 character").isLength({ min: 3 }),
    body("description", "description must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // if there are errors, return Bad request and the errors
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
      return res.status(400).json({ errors: validate.array() });
    }
    try {
      const { title, description, tag } = req.body;
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const saveNote = await note.save();
      res.send(saveNote);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
