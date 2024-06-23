import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");
  } catch (error) {
    console.log("Error connecting to database", error);
  }
};

export default connectToDatabase;
