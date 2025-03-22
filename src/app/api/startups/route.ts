// app/api/startups/route.ts
import { NextResponse } from 'next/server';
import { Startup } from '@/models';

export async function GET() {
    try {
        const startups = await Startup.find({ isVerified: true })
            .select('-password -confirmPassword')
            .lean();

        const startupData = startups.map(s => ({
            startupId: s.startupId,
            name: s.name,
            email: s.email,
            domain: s.domain,
            capital: s.capital,
            tagline: s.tagline,
            companyImage: s.companyImage,
            pitchVideo: s.pitchVideo,
            socialProof: s.socialProof,
            fundingInfo: s.fundingInfo,
            investorPrefs: s.investorPrefs,
            createdAt: s.createdAt,
        }));

        return NextResponse.json({
            success: true,
            data: startupData,
            dataId: startups.map(s => s.startupId)
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}