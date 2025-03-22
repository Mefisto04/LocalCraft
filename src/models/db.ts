import mongoose from "mongoose";

const MONGODB_URI = process.env.PUBLIC_MONGODB_URI || "mongodb://localhost:27017/localcraft";

export async function connectDB() {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}
