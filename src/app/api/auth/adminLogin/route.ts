import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/models/db";
import { User } from "@/models";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Fixed admin credentials - Hardcoded validation
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123";

    // First check if the credentials match our hardcoded admin values
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate JWT
      const token = jwt.sign(
        { 
          email: ADMIN_EMAIL,
          isAdmin: true 
        },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: "1d" }
      );

      const response = NextResponse.json({ success: true });
      
      // Set cookie
      response.cookies.set({
        name: "adminToken",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400, // 1 day
        path: "/",
      });

      return response;
    }

    // If not matching the hardcoded values, check database
    const user = await User.findOne({ email });

    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare password - in a real app this would check hashed password
    const passwordMatch = password === ADMIN_PASSWORD;

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        isAdmin: true 
      },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({ success: true });
    
    // Set cookie
    response.cookies.set({
      name: "adminToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400, // 1 day
      path: "/",
    });

    return response;
    
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
