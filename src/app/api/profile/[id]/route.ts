import { NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import { Startup } from "@/models";
import { Investor } from "@/models";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;

    // Connect to database
    await connectDB();

    // Try to find startup first
    let profile = await Startup.findOne({ startupId: id }).select("-password -confirmPassword");

    // If no startup found, try to find investor
    if (!profile) {
      profile = await Investor.findOne({ investorId: id }).select("-password -confirmPassword");
    }

    // If no profile found at all
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
} 