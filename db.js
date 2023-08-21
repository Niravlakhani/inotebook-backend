const mongoose = require("mongoose");

const url = "mongodb://localhost:27017/iNoteBook";

const connectToMongo = async () => {
  try {
    await mongoose.connect(url);
    console.log("Connect to mongodb successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectToMongo;
