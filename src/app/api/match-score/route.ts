import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Startup } from '@/models'
import { Investor } from '@/models'
import { getMockMatchScores } from '@/utils/promptResponse'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
    try {
        const { investorId, startupIds } = await req.json();
        console.log('Received IDs:', { investorId, startupIds });

        // Validate input
        if (!investorId || !startupIds?.length) {
            return NextResponse.json({
                success: false,
                error: 'Missing required parameters'
            }, { status: 400 });
        }

        // Fetch investor using custom investorId
        const investor = await Investor.findOne({ investorId })
            .select('-password -confirmPassword')
            .lean();
        console.log('Found investor:', !!investor);

        if (!investor) {
            return NextResponse.json({
                success: false,
                error: 'Investor not found'
            }, { status: 404 });
        }

        // Fetch startups using custom startupIds
        const startups = await Startup.find({ startupId: { $in: startupIds } })
            .select('-password -confirmPassword')
            .lean();
        console.log('Found startups:', startups.length);

        if (startups.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No startups found'
            }, { status: 404 });
        }

        // USING MOCK RESPONSES INSTEAD OF GEMINI API
        // Get mock match scores for testing
        const scores = getMockMatchScores(startups.length);
        
        /* 
        // ORIGINAL GEMINI IMPLEMENTATION (COMMENTED OUT)
        // Generate scores
        const scoresPromises = startups.map(async (startup) => {
            // Remove .toObject() calls since we're using .lean()
            const prompt = `Analyze this investor-startup match:
Investor Profile: ${JSON.stringify(investor)}
Startup Profile: ${JSON.stringify(startup)}

Calculate scores with reasoning. Return ONLY JSON:
{
    visionAlignment: { score: number, reason: string },
    domainMatch: { score: number, reason: string },
    growthPotential: { score: number, reason: string }
}`;

            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                console.log('Gemini raw response:', text);

                const cleanedText = text.replace(/```json|```/g, '').trim();
                return JSON.parse(cleanedText);
            } catch (error) {
                console.error(`Error processing startup ${startup.startupId}:`, error);
                return {
                    visionAlignment: { score: 0, reason: 'Error calculating score' },
                    domainMatch: { score: 0, reason: 'Error calculating score' },
                    growthPotential: { score: 0, reason: 'Error calculating score' }
                };
            }
        });

        const scores = await Promise.all(scoresPromises);
        */

        // Combine data - remove .toObject() here as well
        const results = startups.map((startup, index) => ({
            ...startup,
            matchScores: scores[index]
        }));

        return NextResponse.json({ success: true, data: results });
    } catch (error) {
        console.error('Match scoring error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to calculate match scores' },
            { status: 500 }
        );
    }
}