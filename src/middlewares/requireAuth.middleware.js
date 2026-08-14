import { getAuth } from "@clerk/express";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import syncUser from "./syncUser.middleware.js";

const requireAuth = asyncHandler(async (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new ApiError(401, "Unauthorized — please sign in");
  }

  // Delegate to syncUser so req.dbUser is populated before controllers run
  return syncUser(req, res, next);
});

export default requireAuth;