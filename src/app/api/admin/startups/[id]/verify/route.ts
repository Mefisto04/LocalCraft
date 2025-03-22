import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import { Startup } from "@/models";

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
    
    // Update startup verification status
    const updatedStartup = await Startup.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
    );
    
    if (!updatedStartup) {
      return NextResponse.json(
        { success: false, error: "Startup not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedStartup
    });
    
  } catch (error: any) {
    console.error("Error updating startup verification:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update startup" },
      { status: 500 }
    );
  }
}