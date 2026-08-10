import mongoose from "mongoose";

import { env } from "./env.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.connection.on("connected", () => {
      console.log(`MongoDB connected: ${env.MONGODB_DATABASE}`);
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected.");
    });

    await mongoose.connect(
      `${env.MONGODB_URI}/${env.MONGODB_DATABASE}`,
    );
  } catch (error) {
    console.error("Failed to connect MongoDB:", error);
    process.exit(1);
  }
};