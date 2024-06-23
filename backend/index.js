import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import connectToDatabase from "./db/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectToDatabase();
});
