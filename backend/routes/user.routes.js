import express from "express";
import { middleware } from "../middleware/middleware.js";
import {
  followUnfollowUser,
  getSuggestedUsers,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";

const router = express.Router();
router.get("/profile/:username", middleware, getUserProfile);
router.get("/suggested", middleware, getSuggestedUsers);
router.post("/follow/:id", middleware, followUnfollowUser);
router.post("/update", middleware, updateUserProfile);
export default router;
