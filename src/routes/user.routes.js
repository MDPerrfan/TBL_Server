import { Router } from "express";
import requireAuth from "../middlewares/requireAuth.middleware.js";
import requireRole from "../middlewares/requireRole.middleware.js";

const router = Router();

// Get current logged-in user profile
router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.dbUser,
  });
});

// Admin-only route example
router.get("/admin", requireAuth, requireRole("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    user: req.dbUser,
  });
});

export default router;