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
    const { startupId, message } = await request.json();

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

    // In a real application, this would:
    // 1. Store the negotiation message in a messages collection
    // 2. Create a notification for the investor
    // 3. Possibly update the bid status to "in_negotiation"

    // For this example, we'll just add a comment to the bid
    await Bid.findByIdAndUpdate(
      bidId,
      {
        $push: {
          negotiations: {
            message,
            sentBy: "startup",
            createdAt: new Date()
          }
        }
      }
    );

    return NextResponse.json({
      message: "Negotiation message sent successfully"
    }, { status: 200 });
  } catch (error) {
    console.error("Error sending negotiation message:", error);
    return NextResponse.json(
      { error: "Failed to send negotiation message" },
      { status: 500 }
    );
  }
} 