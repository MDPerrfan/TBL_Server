import "dotenv/config";

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT) || 5000,

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  MONGODB_URI: requiredEnv("MONGODB_URI"),
  MONGODB_DATABASE: requiredEnv("MONGODB_DATABASE"),
} as const;