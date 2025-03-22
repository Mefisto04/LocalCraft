import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

export interface IBid extends Document {
    startupId: string;
    investorId: string;
    amount: number;
    equity: number;
    royalty: number;
    conditions: string[];
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    negotiations?: {
        message: string;
        sentBy: 'startup' | 'investor';
        createdAt: Date;
    }[];
}

export const BidSchema = new Schema<IBid>(
    {
        startupId: { type: String, required: true, ref: 'Startup' },
        investorId: { type: String, required: true, ref: 'Investor' },
        amount: { type: Number, required: true },
        equity: { type: Number, required: true },
        royalty: { type: Number, required: true },
        conditions: [{ type: String, required: true }],
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
            required: true
        },
        createdAt: { type: Date, default: Date.now },
        negotiations: [{
            message: { type: String, required: true },
            sentBy: { 
                type: String,
                enum: ['startup', 'investor'],
                required: true
            },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    { timestamps: true }
);

export const Bid = mongoose.models.Bid || mongoose.model<IBid>("Bid", BidSchema);

// Zod Validation
export const BidValidation = z.object({
    startupId: z.string(),
    investorId: z.string(),
    amount: z.number().positive("Amount must be positive"),
    equity: z.number().min(0, "Equity cannot be negative").max(100, "Equity cannot exceed 100%"),
    royalty: z.number().min(0, "Royalty cannot be negative").max(100, "Royalty cannot exceed 100%"),
    conditions: z.array(z.string()),
    status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
    negotiations: z.array(z.object({
        message: z.string(),
        sentBy: z.enum(['startup', 'investor']),
        createdAt: z.date().optional()
    })).optional()
});
