import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connetDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Connection failed", error.message);
    process.exit(1);
  }
};

export default connetDB;
