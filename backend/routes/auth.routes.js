import express from "express";
import {
  getMe,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import { middleware } from "../middleware/middleware.js";

const router = express.Router();

router.get("/me", middleware, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
