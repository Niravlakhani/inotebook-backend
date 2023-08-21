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
      res.send({ saveNote, message: "Note has been created successfully!" });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 3: Update The existing Note Using : Put "/api/notes/update-note/:id" Login required

router.put(
  "/update-note/:id",
  useMiddleware,
  [
    body("title", "Title must be atleast 5 character").isLength({ min: 3 }),
    body("description", "description must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const { title, description, tag } = req.body;
    const { id } = req.params;

    try {
      const newNoteData = {};

      // create a new object
      if (title) {
        newNoteData.title = title;
      }
      if (description) {
        newNoteData.description = description;
      }
      if (tag) {
        newNoteData.tag = tag;
      }

      // find the note to be updated and update it.

      const note = await Notes.findById(id);
      if (!note) {
        return res.status(404).send("Not Found");
      }

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Unauthorised user!");
      }

      const result = await Notes.findByIdAndUpdate(
        id,
        { $set: newNoteData },
        { new: true }
      );

      res.json({ result, message: "Note has been updated successfully!" });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 4: Delete The existing Note Using : Delete "/api/notes/delete-note/:id" Login required

router.delete("/delete-note/:id", useMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // find the note to be updated and delete it.

    const note = await Notes.findById(id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    // allow deletion only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Unauthorised user!");
    }
    const result = await Notes.findByIdAndDelete(id);
    if (result) {
      res.json({ message: "Note has been deleted successfully!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
