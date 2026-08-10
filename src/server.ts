import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(
      `The Barber Lounge API running on http://localhost:${env.PORT}`,
    );
  });

  /**
   * Graceful shutdown
   */
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer();