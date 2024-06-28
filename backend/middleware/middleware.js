import { json } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const middleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized:You are not logged in" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized:Invalid token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized:User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in middleware.js:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
