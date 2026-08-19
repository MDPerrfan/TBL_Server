import mongoose from "mongoose";
import env from "./env.js";

// Global cache to prevent multiple connections in serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: env.dbName,
      bufferCommands: false, 
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB Atlas can't be reached
    };

    cached.promise = mongoose.connect(env.mongoUri, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset promise on failure so next request can retry
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

export default connectDB;