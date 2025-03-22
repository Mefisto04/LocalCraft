import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// Mongoose Schema
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    createdAt: Date;
}

export const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        confirmPassword: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// export const User = mongoose.model<IUser>("User", UserSchema);

// Zod Validation
export const UserValidation = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
});
