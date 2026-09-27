import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI must be configured in backend/.env");

    await mongoose.connect(uri);
    console.log("DB Connected");
};