import express from "express";
import { middleware } from "../middleware/middleware.js";
import {
  deleteNotification,
  deleteNotifications,
  getNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", middleware, getNotifications);
router.delete("/", middleware, deleteNotifications);

export default router;
