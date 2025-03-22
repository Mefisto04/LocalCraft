import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import { Investor } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Fetch all investors but exclude sensitive information
    const investors = await Investor.find({}, {
      password: 0,
      confirmPassword: 0
    }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      investors,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching investors:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch investors",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}