import { NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import mongoose from "mongoose";
import { Investor } from "@/models";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ investorId: string }> }
) {
  try {
    await connectDB();
    const {investorId} = await params;

    const investor = await Investor.findOne({ investorId }).select(
      "name email domain capital expertise vision pastFunding"
    );

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ investor }, { status: 200 });
  } catch (error) {
    console.error("Error fetching investor:", error);
    return NextResponse.json(
      { error: "Failed to fetch investor" },
      { status: 500 }
    );
  }
} 