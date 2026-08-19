import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import connectDB from "../config/db.js";

const syncUser = asyncHandler(async (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return next();
  }

  await connectDB();

  // Fetch fresh user data from Clerk first
  const clerkUser = await clerkClient.users.getUser(userId);
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || "";
  const primaryPhone = clerkUser.phoneNumbers[0]?.phoneNumber || "";

  const updateData = {
    email: primaryEmail,
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
    avatar: clerkUser.imageUrl || "",
    phone: primaryPhone,
  };

  // Atomically find and update, or create if it doesn't exist (prevents 409 duplicate key errors)
  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    { $set: updateData, $setOnInsert: { clerkId: userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  req.dbUser = user;
  next();
});

export default syncUser;