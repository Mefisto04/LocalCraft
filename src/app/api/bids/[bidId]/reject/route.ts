import { NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import { Bid } from "@/models/Bid";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bidId: string }> }
) {
  try {
    await connectDB();
    const { bidId } = await params;
    const { startupId } = await request.json();

    // Check if the bid exists
    const bid = await Bid.findById(bidId);
    if (!bid) {
      return NextResponse.json(
        { error: "Bid not found" },
        { status: 404 }
      );
    }

    // Verify that the bid belongs to the requesting startup
    if (bid.startupId !== startupId) {
      return NextResponse.json(
        { error: "Unauthorized. This bid does not belong to your startup" },
        { status: 403 }
      );
    }

    // Delete the bid
    await Bid.findByIdAndDelete(bidId);

    return NextResponse.json({
      message: "Bid rejected and removed successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error rejecting bid:", error);
    return NextResponse.json(
      { error: "Failed to reject bid" },
      { status: 500 }
    );
  }
} 