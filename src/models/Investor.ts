import { Schema, Document } from "mongoose";
import { z } from "zod";

export interface IInvestor extends Document {
    investorId: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    domain: string;
    capital: number;
    pastFunding: {
        companyName: string;
        amount: number;
        year: number;
    }[];
    vision: string;
    expertise: string[];
    createdAt: Date;
    isVerified: boolean;
}

export const InvestorSchema = new Schema<IInvestor>(
    {
        investorId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        confirmPassword: { type: String, required: true },
        domain: { type: String, required: true },
        capital: { type: Number, required: true },
        pastFunding: [{
            companyName: { type: String, required: true },
            amount: { type: Number, required: true },
            year: { type: Number, required: true }
        }],
        vision: { type: String, required: true },
        expertise: [{ type: String, required: true }],
        createdAt: { type: Date, default: Date.now },
        isVerified: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Zod Validation Only - Remove model definition here
export const InvestorValidation = z.object({
    investorId: z.string(),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    domain: z.string(),
    capital: z.number(),
    pastFunding: z.array(z.object({
        companyName: z.string(),
        amount: z.number(),
        year: z.number()
    })),
    vision: z.string(),
    expertise: z.array(z.string()),
    isVerified: z.boolean()
});