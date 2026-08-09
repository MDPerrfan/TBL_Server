import "dotenv/config";

import app from "./config/app.js";

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `The Barber Lounge API running on http://localhost:${PORT}`,
  );
});

/**
 * ---------------------------------------------------------
 * Graceful shutdown
 * ---------------------------------------------------------
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