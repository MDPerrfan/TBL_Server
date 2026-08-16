import { Webhook } from "svix";
import env from "../config/env.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const clerkWebhook = asyncHandler(async (req, res) => {
  const WEBHOOK_SECRET = env.clerk.webhookSecret;

  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSignature = req.headers["svix-signature"];

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new ApiError(400, "Missing svix headers");
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let event;

  try {
    // req.body MUST be the raw Buffer here — not JSON-parsed —
    // or svix's signature verification will fail. See app.js wiring below.
    event = wh.verify(req.body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    throw new ApiError(400, `Webhook verification failed: ${err.message}`);
  }

  const { type, data } = event;

  switch (type) {
    case "user.created": {
      const existing = await User.findOne({ clerkId: data.id });
      if (existing) break;

      await User.create({
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address || "",
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        avatar: data.image_url || "",
        phone: data.phone_numbers?.[0]?.phone_number || "",
      });
      break;
    }

    case "user.updated": {
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          email: data.email_addresses?.[0]?.email_address || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          avatar: data.image_url || "",
          phone: data.phone_numbers?.[0]?.phone_number || "",
        },
        { new: true }
      );
      break;
    }

    case "user.deleted": {
      // Soft-delete: keep the record (bookings/history reference it)
      // but mark inactive rather than hard-deleting.
      await User.findOneAndUpdate({ clerkId: data.id }, { isActive: false });
      break;
    }

    default:
      console.log(`Unhandled Clerk webhook event: ${type}`);
  }

  return res.status(200).json(new ApiResponse(200, null, "Webhook processed"));
});

export default clerkWebhook;