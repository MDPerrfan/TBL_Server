import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";

import { notFoundMiddleware } from "../middleware/not-found.middleware";
import { errorMiddleware } from "../middleware/error.middleware.js";

const app = express();

/**
 * ---------------------------------------------------------
 * Security
 * ---------------------------------------------------------
 */

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

/**
 * ---------------------------------------------------------
 * Request parsing
 * ---------------------------------------------------------
 */

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

/**
 * ---------------------------------------------------------
 * Rate limiting
 * ---------------------------------------------------------
 */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again later.",
    },
  },
});

app.use("/api", apiLimiter);

/**
 * ---------------------------------------------------------
 * Request logging
 * ---------------------------------------------------------
 */

app.use(
  pinoHttp({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  }),
);

/**
 * ---------------------------------------------------------
 * API
 * ---------------------------------------------------------
 */

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "the-barber-lounge-api",
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * ---------------------------------------------------------
 * Error handling
 * ---------------------------------------------------------
 */

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;