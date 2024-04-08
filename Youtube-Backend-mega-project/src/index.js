// require('dotenv').config({ path: './env' });
import dotenv from "dotenv";
import connectedDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectedDB()
  .then(() => {
    app.on("ERROR: ", (error) => {
      console.error(error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB connection FAILED: ${error}`);
  });

// first appraoch to connect to the database
/*
import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    app.on("ERROR: ", (error) => {
      console.error(error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR: ", error);
    throw error;
  }
})();
*/
