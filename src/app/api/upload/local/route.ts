import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    console.log("Local upload API called");
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log("No file provided");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    console.log(`File received: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      console.log(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: "The file must be an image" },
        { status: 400 }
      );
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      console.log(`File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: `File size exceeds the maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }
    
    // Convert file to data URL (base64)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    return NextResponse.json({
      url: dataUrl,
      fileType: file.type,
      originalName: file.name,
    });
  } catch (error) {
    console.error("Local upload error:", error);
    return NextResponse.json(
      {
        error: "File upload failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 