import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://farkaszalan2001:SAwYhi3oQwITMC6D@cyberfish.5feja.mongodb.net/CyberFish?retryWrites=true&w=majority&appName=CyberFish");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
};

export default connectDB;