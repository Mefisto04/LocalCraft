import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import { Investor } from "@/models";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isVerified } = await request.json();
    
    if (isVerified === undefined) {
      return NextResponse.json(
        { success: false, error: "Verification status is required" },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Update investor verification status
    const updatedInvestor = await Investor.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
    );
    
    if (!updatedInvestor) {
      return NextResponse.json(
        { success: false, error: "Investor not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedInvestor
    });
    
  } catch (error: any) {
    console.error("Error updating investor verification:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update investor" },
      { status: 500 }
    );
  }
}