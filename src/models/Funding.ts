import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

export interface IFunding extends Document {
    startupId: string;
    investorId: string;
    amount: number;
    equity: number;
    royalty: number;
    conditions: string[];
    createdAt: Date;
}

export const FundingSchema = new Schema<IFunding>(
    {
        startupId: { type: String, required: true, ref: 'Startup' },
        investorId: { type: String, required: true, ref: 'Investor' },
        amount: { type: Number, required: true },
        equity: { type: Number, required: true },
        royalty: { type: Number, required: true },
        conditions: [{ type: String, required: true }],
        createdAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

// export const Funding = mongoose.model<IFunding>("Funding", FundingSchema);

// Zod Validation
export const FundingValidation = z.object({
    startupId: z.string(),
    investorId: z.string(),
    amount: z.number(),
    equity: z.number(),
    royalty: z.number(),
    conditions: z.array(z.string())
});
