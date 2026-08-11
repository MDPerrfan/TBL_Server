import dns from "node:dns";
dns.setServers(['8.8.8.8', '1.1.1.1']);
import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
      console.log(`http://localhost:${env.port}`);
    });

    // Handle unhandled promise rejections gracefully
    process.on("unhandledRejection", (err) => {
      console.error(` Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(` Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();