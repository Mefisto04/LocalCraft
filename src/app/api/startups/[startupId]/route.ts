import { NextRequest, NextResponse } from 'next/server';
import { Startup } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ startupId: string }> }
) {
  try {
    // Properly await the params destructuring
    const { startupId } = await params;

    // Fetch startup details
    const startup = await Startup.findOne({ startupId })
      .select('-password -confirmPassword')
      .lean();

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...startup,
        // Add any additional computed fields here
      }
    });

  } catch (error: any) {
    console.error('Error fetching startup details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}