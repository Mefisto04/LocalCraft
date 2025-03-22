import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import { Startup } from "@/models";

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Fetch all startups
    const startups = await Startup.find({})
      .select("startupId name email domain capital createdAt isVerified")
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: startups
    });
    
  } catch (error: any) {
    console.error("Error fetching startups:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch startups" },
      { status: 500 }
    );
  }
}