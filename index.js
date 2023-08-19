const connectToMongo = require("./db");
const express = require("express");
require("dotenv").config();
connectToMongo();

const app = express();
const port = 5000;

app.use(express.json());

app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/notes", require("./routes/notes.js"));

app.listen(port, () => {
  console.log(`listen app at http://localhost:${port}`);
});
