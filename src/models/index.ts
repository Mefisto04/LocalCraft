import mongoose from "mongoose";
import { IStartup } from "./Startup";
import { IInvestor } from "./Investor";
import { IFunding } from "./Funding";
import { IBid } from "./Bid";
import { IUser } from "./User";

// Import schemas from their respective files
import { StartupSchema } from "./Startup";
import { InvestorSchema } from "./Investor";
import { FundingSchema } from "./Funding";
import { BidSchema } from "./Bid";
import { UserSchema } from "./User";

// Helper function to prevent model overwrites
const createModel = <T extends mongoose.Document>(name: string, schema: mongoose.Schema<T>) => {
    return mongoose.models[name] || mongoose.model<T>(name, schema);
};

// Create and export all models
export const Startup = createModel<IStartup>("Startup", StartupSchema);
export const Investor = createModel<IInvestor>("Investor", InvestorSchema);
export const Funding = createModel<IFunding>("Funding", FundingSchema);
export const Bid = createModel<IBid>("Bid", BidSchema);
export const User = createModel<IUser>("User", UserSchema);