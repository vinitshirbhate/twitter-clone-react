import express from "express";
import { middleware } from "../middleware/middleware.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/post.controller.js";
const router = express.Router();

router.get("/all", middleware, getAllPosts);
router.get("/following", middleware, getFollowingPosts);
router.get("/liked/:id", middleware, getLikedPosts);
router.get("/user/:username", middleware, getUserPosts);
router.post("/create", middleware, createPost);
router.post("/like/:id", middleware, likeUnlikePost);
router.post("/comment/:id", middleware, commentOnPost);
router.delete("/:id", middleware, deletePost);

export default router;
