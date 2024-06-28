import { v2 as cloudinary } from "cloudinary";

import Notification from "../models/notifications.model.js";
import User from "../models/user.model.js";

import bcrypt from "bcrypt";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in user.controller.js/getUserProfile:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const isfollowing = currentUser.following.includes(id);
    if (isfollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "Unfollow successful" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const notification = new Notification({
        from: req.user._id,
        to: id,
        type: "follow",
      });

      await notification.save();
      res.status(200).json({ message: "Follow successful" });
    }
  } catch (error) {
    console.error(
      "Error in user.controller.js/followUnfollowUser:",
      error.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFollowers = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);
    const filteredUsers = users.filter((user) => {
      return !userFollowers.following.includes(user._id);
    });
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error(
      "Error in user.controller.js/getSuggestedUsers:",
      error.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  const {
    fullname,
    username,
    email,
    currentPassword,
    newPassword,
    bio,
    links,
  } = req.body;

  const { profilePic, coverPic } = req.body;

  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Please provide current and new password" });
    }

    if (currentPassword && newPassword) {
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const uploadedProfilePic = await cloudinary.uploader.upload(profilePic);
      user.profilePic = uploadedProfilePic.secure_url;
    }
    if (coverPic) {
      if (user.coverPic) {
        await cloudinary.uploader.destroy(
          user.coverPic.split("/").pop().split(".")[0]
        );
      }
      const uploadedCoverPic = await cloudinary.uploader.upload(coverPic);
      user.coverPic = uploadedCoverPic.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.links = links || user.links;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.coverPic = coverPic || user.coverPic;

    await user.save();
    //doest not update database because user.save() is before this
    user.password = null;
    res.status(200).json(user);
  } catch (error) {
    console.error(
      "Error in user.controller.js/updateUserProfile:",
      error.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};
