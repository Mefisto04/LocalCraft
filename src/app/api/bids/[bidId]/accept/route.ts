import { NextResponse } from "next/server";
import { connectDB } from "@/models/db";
import mongoose from "mongoose";
import { Bid } from "@/models/Bid";
import { Investor } from "@/models";
import { Startup } from "@/models";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bidId: string }> }
) {
  // Await the promise to get the params object
  const { bidId } = await params;

  try {
    await connectDB();
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

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Update the current bid to accepted
      await Bid.findByIdAndUpdate(bidId, { status: "accepted" }, { session });

      // 2. Reject all other pending bids for this startup
      await Bid.updateMany(
        {
          startupId,
          _id: { $ne: bidId },
          status: "pending"
        },
        { status: "rejected" },
        { session }
      );

      // 3. Update the investor's record
      const startup = await Startup.findOne({ startupId }).session(session);

      await Investor.findOneAndUpdate(
        { investorId: bid.investorId },
        {
          $push: {
            pastFunding: {
              companyName: startup?.name || "Unknown Startup",
              amount: bid.amount,
              year: new Date().getFullYear()
            }
          }
        },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(
        { message: "Bid accepted successfully" },
        { status: 200 }
      );
    } catch (error) {
      // Abort transaction if anything fails
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error accepting bid:", error);
    return NextResponse.json(
      { error: "Failed to accept bid" },
      { status: 500 }
    );
  }
}
