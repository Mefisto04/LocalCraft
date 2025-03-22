import { NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import { Bid } from "@/models/Bid";
import { Startup } from "@/models";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ investorId: string }> }
) {
  try {
    await connectDB();
    const { investorId } = await params;

    // Find all rejected bids for this investor
    const bids = await Bid.find({
      investorId,
      status: "rejected"
    }).sort({ updatedAt: -1 });

    // Get startup details for each bid
    const bidsWithStartupInfo = await Promise.all(
      bids.map(async (bid) => {
        const startup = await Startup.findOne({ startupId: bid.startupId })
          .select("name");

        return {
          ...bid.toObject(),
          startupName: startup?.name || "Unknown Startup"
        };
      })
    );

    return NextResponse.json({ bids: bidsWithStartupInfo }, { status: 200 });
  } catch (error) {
    console.error("Error fetching rejected bids:", error);
    return NextResponse.json(
      { error: "Failed to fetch rejected bids" },
      { status: 500 }
    );
  }
} 