import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstances = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB_HOST ${connectionInstances.connection.host} \n`
    );
  } catch (error) {
    console.log(`MongoDB connection failed: ${error}`);
    process.exit(1); // exit with failure
  }
};

export default connectDB;
