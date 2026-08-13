import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError errors (e.g. Mongoose, unexpected throws) into ApiError shape
  if (!(error instanceof ApiError)) {
    const statusCode = error.statuscode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle common Mongoose error types explicitly for cleaner messages
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ApiError(409, `Duplicate value for field: ${field}`);
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, "Validation failed", messages);
  }

  const response = {
    success: false,
    statusCode: error.statuscode,
    message: error.message,
    errors: error.errors,
    // Stack trace only in development — never leak it in production
    ...(env.nodeEnv === "development" && { stack: error.stack }),
  };

  return res.status(error.statuscode).json(response);
};

export default errorHandler;