import { NextRequest, NextResponse } from 'next/server';
import { Bid } from '@/models';
import { BidValidation } from '@/models/Bid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Ensure status is set to pending for new bids
    const dataToValidate = {
      ...body,
      status: 'pending'
    };

    // Validate the request body
    const validatedData = BidValidation.parse(dataToValidate);

    // Create new bid
    const bid = await Bid.create(validatedData);

    return NextResponse.json({
      success: true,
      data: bid
    });

  } catch (error: any) {
    console.error('Error creating bid:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid bid data',
          details: error.errors
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create bid'
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    const investorId = searchParams.get('investorId');

    let query = {};
    if (startupId) query = { ...query, startupId };
    if (investorId) query = { ...query, investorId };

    const bids = await Bid.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: bids
    });

  } catch (error: any) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch bids'
      },
      { status: 500 }
    );
  }
} 