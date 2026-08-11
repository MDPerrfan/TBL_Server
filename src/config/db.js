import mongoose from "mongoose";
import env from "./env.js";

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      dbName: env.dbName,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    retryCount = 0; // reset on success

    return conn;
  } catch (error) {
    console.error(` MongoDB connection error: ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying connection (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_DELAY_MS);
    } else {
      console.error("Max retries reached. Exiting process.");
      process.exit(1);
    }
  }
};

// Connection event listeners for runtime visibility
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB runtime error: ${err.message}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination (SIGINT)");
  process.exit(0);
});

export default connectDB;