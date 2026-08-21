import { Router } from "express";
import requireAuth from "../middlewares/requireAuth.middleware.js";
import requireRole from "../middlewares/requireRole.middleware.js";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

const router = Router();

router.get("/", getAllServices); // public — frontend reads this
router.post("/", requireAuth, requireRole("admin"), createService);
router.patch("/:id", requireAuth, requireRole("admin"), updateService);
router.delete("/:id", requireAuth, requireRole("admin"), deleteService);

export default router;