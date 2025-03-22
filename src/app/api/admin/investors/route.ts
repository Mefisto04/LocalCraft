import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import { Investor } from "@/models";

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Fetch all investors
    const investors = await Investor.find({})
      .select("investorId name email domain capital createdAt isVerified")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: investors
    });
    
  } catch (error: any) {
    console.error("Error fetching investors:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch investors" },
      { status: 500 }
    );
  }
}