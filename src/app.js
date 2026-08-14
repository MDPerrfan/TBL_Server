import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoSanitize from "./middlewares/sanitize.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";
import env from "./config/env.js";
import { clerkMiddleware } from "@clerk/express";
import requireAuth from "./middlewares/requireAuth.middleware.js";
import userRoutes from "./routes/user.routes.js";
const app = express();

// SECURITY MIDDLEWARE
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(mongoSanitize);

// 
// ROUTES (will mount here later)

// BODY PARSERS
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(compression());

app.use(clerkMiddleware());
// LOGGING
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.get("/api/v1/test-auth", requireAuth, (req, res) => {
  res.status(200).json({ success: true, user: req.dbUser });
});

app.use("/api/v1/users", userRoutes);
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


// 404 + ERROR HANDLERS (added once middlewares/ layer is built)
app.use(notFound);
app.use(errorHandler);

export default app;