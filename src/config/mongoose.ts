import mongoose from "mongoose";
import "dotenv/config";

export const connectToMongo = async () => {
  try {
    return await mongoose.connect(
      process.env.MONGODB_CONNECTION_STRING as string
    );
    // .then(() => {
    //   console.log(
    //     "connectToMongo ~ process.env.MONGODB_CONNECTION_STRING:",
    //     process.env.MONGODB_CONNECTION_STRING
    //   );
    // });
  } catch (error) {
    console.log("file: mongoose.js:11 ~ connectToMongo ~ error:", error);
    throw error;
  }
};
