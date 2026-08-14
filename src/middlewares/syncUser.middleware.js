import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const syncUser = asyncHandler(async (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return next();
  }

  let user = await User.findOne({ clerkId: userId });

  // Fetch fresh user data from Clerk
  const clerkUser = await clerkClient.users.getUser(userId);
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || "";
  const primaryPhone = clerkUser.phoneNumbers[0]?.phoneNumber || "";

  if (!user) {
    // Create user if not exists
    user = await User.create({
      clerkId: clerkUser.id,
      email: primaryEmail,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      avatar: clerkUser.imageUrl || "",
      phone: primaryPhone,
    });
  } else {
    // Keep local DB updated with profile changes made in Clerk
    const hasChanged =
      user.email !== primaryEmail ||
      user.firstName !== (clerkUser.firstName || "") ||
      user.lastName !== (clerkUser.lastName || "") ||
      user.avatar !== (clerkUser.imageUrl || "") ||
      user.phone !== primaryPhone;

    if (hasChanged) {
      user.email = primaryEmail;
      user.firstName = clerkUser.firstName || "";
      user.lastName = clerkUser.lastName || "";
      user.avatar = clerkUser.imageUrl || "";
      user.phone = primaryPhone;
      await user.save();
    }
  }

  req.dbUser = user;
  next();
});

export default syncUser;