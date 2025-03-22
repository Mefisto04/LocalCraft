import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/lib/jwt";
import { Startup, Investor } from "@/models";
import { connectDB } from "@/models/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Registration request body:", body); // Debug log

        const { email, password, confirmPassword, userType, ...rest } = body;

        // Validate required fields
        if (!email || !password || !confirmPassword || !userType) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        // Validate userType
        if (!["startup", "investor"].includes(userType)) {
            return NextResponse.json(
                { error: "Invalid user type" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await Promise.all([
            Startup.findOne({ email }),
            Investor.findOne({ email }),
        ]);

        if (existingUser[0] || existingUser[1]) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user based on type
        let user;
        try {
            if (userType === "startup") {
                // Validate startup-specific fields
                if (!rest.name || !rest.domain || !rest.capital || !rest.tagline) {
                    return NextResponse.json(
                        { error: "Missing required startup fields" },
                        { status: 400 }
                    );
                }

                const startupData = {
                    name: rest.name,
                    email,
                    password: hashedPassword,
                    confirmPassword: hashedPassword,
                    domain: rest.domain,
                    capital: Number(rest.capital),
                    tagline: rest.tagline,
                    startupId: `ST${Date.now()}`,
                    companyImage: {
                        url: rest.companyImage?.url || "",
                        fileType: rest.companyImage?.fileType || "",
                        originalName: rest.companyImage?.originalName || ""
                    },
                    pitchVideo: {
                        url: rest.pitchVideo?.url || "",
                        fileType: rest.pitchVideo?.fileType || "",
                        originalName: rest.pitchVideo?.originalName || ""
                    },
                    socialProof: {
                        instagramFollowers: rest.socialProof?.instagramFollowers || 0
                    },
                    fundingInfo: {
                        currentRound: rest.fundingInfo?.currentRound || "Seed",
                        amountRaised: rest.fundingInfo?.amountRaised || 0,
                        targetAmount: rest.fundingInfo?.targetAmount || Number(rest.capital)
                    },
                    investorPrefs: {
                        minInvestment: rest.investorPrefs?.minInvestment || 0,
                        maxInvestment: rest.investorPrefs?.maxInvestment || Number(rest.capital),
                        preferredIndustries: rest.investorPrefs?.preferredIndustries || [],
                        preferredStages: rest.investorPrefs?.preferredStages || []
                    },
                    isVerified: false
                };

                user = await Startup.create(startupData);
            } else if (userType === "investor") {
                // Validate investor-specific fields
                if (!rest.name || !rest.domain || !rest.capital || !rest.vision || !rest.expertise) {
                    return NextResponse.json(
                        { error: "Missing required investor fields" },
                        { status: 400 }
                    );
                }

                // Process pastFunding data
                const pastFunding = Array.isArray(rest.pastFunding) ? rest.pastFunding : [];
                
                // Filter out incomplete entries
                const validPastFunding = pastFunding.filter(
                    (item: any) => item.companyName && item.amount && item.year
                );

                user = await Investor.create({
                    name: rest.name,
                    email,
                    password: hashedPassword,
                    confirmPassword: hashedPassword,
                    domain: rest.domain,
                    capital: Number(rest.capital),
                    vision: rest.vision,
                    expertise: Array.isArray(rest.expertise) ? rest.expertise : rest.expertise.split(",").map((s: string) => s.trim()),
                    investorId: `IN${Date.now()}`,
                    pastFunding: validPastFunding,
                    isVerified: false
                });
            } else {
                return NextResponse.json(
                    { error: "Invalid user type" },
                    { status: 400 }
                );
            }
        } catch (createError) {
            console.error("Error creating user:", createError);
            return NextResponse.json(
                { error: "Error creating user", details: createError instanceof Error ? createError.message : "Unknown error" },
                { status: 500 }
            );
        }

        // Generate JWT token
        const token = await encrypt({
            id: user._id,
            email: user.email,
            userType,
        });

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return NextResponse.json({
            message: "Registration successful",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                userType,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
