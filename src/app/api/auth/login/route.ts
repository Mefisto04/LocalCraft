import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/lib/jwt";
import { Startup, Investor } from "@/models";
import { connectDB } from "@/models/db";
import bcrypt from "bcryptjs";

// export async function POST(request: Request) {
//     try {
//         const body = await request.json();
//         const { email, password, userType } = body;

//         await connectDB();

//         let user;
//         if (userType === "startup") {
//             user = await Startup.findOne({ email });
//         } else {
//             user = await Investor.findOne({ email });
//         }

//         if (!user) {
//             return NextResponse.json(
//                 { error: "User not found" },
//                 { status: 404 }
//             );
//         }

//         const isPasswordValid = await bcrypt.compare(password, user.password);

//         if (!isPasswordValid) {
//             return NextResponse.json(
//                 { error: "Invalid password" },
//                 { status: 401 }
//             );
//         }

//         const token = await encrypt({
//             id: user._id,
//             email: user.email,
//             userType,
//         });

//         const cookieStore = await cookies();
//         cookieStore.set("token", token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict",
//             maxAge: 60 * 60 * 24, // 24 hours
//         });

//         return NextResponse.json({
//             message: "Login successful",
//             user: {
//                 id: user._id,
//                 email: user.email,
//                 name: user.name,
//                 userType,
//             },
//         });
//     } catch (error) {
//         console.error("Login error:", error);
//         return NextResponse.json(
//             { error: "Internal server error" },
//             { status: 500 }
//         );
//     }
// }


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, userType } = body;

        await connectDB();

        let user;
        if (userType === "startup") {
            user = await Startup.findOne({ email });
        } else {
            user = await Investor.findOne({ email });
        }

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 401 }
            );
        }

        const token = await encrypt({
            id: user._id,
            email: user.email,
            userType,
        });

        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return NextResponse.json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                userType,
                startupId: userType === "startup" ? user.startupId : undefined,
                investorId: userType === "investor" ? user.investorId : undefined,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}