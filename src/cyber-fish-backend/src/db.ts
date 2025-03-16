import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from a .env file into process.env
dotenv.config();

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the connection string from environment variables
        await mongoose.connect(process.env.MONGODB_CONNECT_STRING || "");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
};

export default connectDB;