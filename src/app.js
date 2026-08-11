import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";

import env from "./config/env.js";

const app = express();

// SECURITY MIDDLEWARE
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(mongoSanitize());

// BODY PARSERS
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(compression());

// LOGGING
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// HEALTH CHECK
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "The Barber Lounge API is running 💈",
    env: env.nodeEnv,
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// 
// ROUTES (will mount here later)
// app.use("/api/v1", routes);

// 404 + ERROR HANDLERS (added once middlewares/ layer is built)

export default app;