import { Schema } from "mongoose";
import { Document } from "mongoose";
import { z } from "zod";

export interface IStartup extends Document {
    startupId: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    domain: string;
    capital: number;
    tagline: string;
    companyImage: {
        url: string;
        fileType: string;
        originalName: string;
    };

    pitchVideo: {
        url: string;
        fileType: string;
        originalName: string;
    };
    socialProof: {
        instagramFollowers: number;
    };
    fundingInfo: {
        currentRound: string;
        amountRaised: number;
        targetAmount: number;
    };
    investorPrefs: {
        minInvestment: number;
        maxInvestment: number;
        preferredIndustries: string[];
        preferredStages: string[];
    };
    createdAt: Date;
    isVerified: boolean;
}

export const StartupSchema = new Schema<IStartup>(
    {
        startupId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        confirmPassword: { type: String, required: true },
        domain: { type: String, required: true },
        capital: { type: Number, required: true },
        tagline: { type: String, required: true },
        companyImage: {
            url: { type: String },
            fileType: { type: String },
            originalName: { type: String }
        },
        pitchVideo: {
            url: { type: String, default: "" },
            fileType: { type: String, default: "" },
            originalName: { type: String, default: "" }
        },
        
        socialProof: {
            instagramFollowers: { type: Number, default: 0 }
        },
        fundingInfo: {
            currentRound: { type: String, required: true },
            amountRaised: { type: Number, default: 0 },
            targetAmount: { type: Number, required: true }
        },
        investorPrefs: {
            minInvestment: { type: Number, required: true },
            maxInvestment: { type: Number, required: true },
            preferredIndustries: [{ type: String }],
            preferredStages: [{ type: String }]
        },
        createdAt: { type: Date, default: Date.now },
        isVerified: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Zod Validation
export const StartupValidation = z.object({
    startupId: z.string(),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    domain: z.string(),
    capital: z.number(),
    tagline: z.string(),
    companyImage: z.object({
        url: z.string(),
        fileType: z.string(),
        originalName: z.string()
    }).optional(),
    pitchVideo: z.object({
        url: z.string().default(""),
        fileType: z.string().default(""),
        originalName: z.string().default("")
    }).optional(),
    socialProof: z.object({
        instagramFollowers: z.number()
    }),
    fundingInfo: z.object({
        currentRound: z.string(),
        amountRaised: z.number(),
        targetAmount: z.number()
    }),
    investorPrefs: z.object({
        minInvestment: z.number(),
        maxInvestment: z.number(),
        preferredIndustries: z.array(z.string()),
        preferredStages: z.array(z.string())
    }),
    isVerified: z.boolean()
});
