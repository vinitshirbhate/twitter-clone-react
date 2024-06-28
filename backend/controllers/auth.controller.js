import { genrateAndSetCookie } from "../libs/utils/genrateAndSetCookie.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    genrateAndSetCookie(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullname: newUser.fullname,
      followers: newUser.followers,
      following: newUser.following,
      profilePic: newUser.profilePic,
      coverPic: newUser.coverPic,
    });
  } catch (error) {
    console.error("Error in auth.controller.js/signup:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Username not found" });
    }

    const isPAsswordValid = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPAsswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    genrateAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      followers: user.followers,
      following: user.following,
      profilePic: user.profilePic,
      coverPic: user.coverPic,
    });
  } catch (error) {
    console.error("Error in auth.controller.js/login:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0, httpOnly: true });
    res.status(200).json({ message: "logout" });
  } catch (error) {
    console.error("Error in auth.controller.js/logout:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.send(user);
  } catch (error) {
    console.error("Error in auth.controller.js/getMe:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
