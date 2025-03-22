import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    // Add debugging
    console.log("Upload API called");

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log("No file provided");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Debug file info
    console.log(`File received: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      console.log(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: "The file must be an image" },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}-${file.name}`;
    console.log(`Generated filename: ${fileName}`);

    // Check if environment variables are set
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not set");
      // For development, create a temporary approach
      return NextResponse.json({
        url: `https://placeholder.co/400x300?text=${encodeURIComponent(file.name)}`,
        fileType: file.type,
        originalName: file.name
      });
    }

    try {
      // Upload to Vercel Blob
      const blob = await put(fileName, file, {
        access: 'public',
      });

      console.log(`File uploaded successfully: ${blob.url}`);
      return NextResponse.json({
        url: blob.url,
        fileType: file.type,
        originalName: file.name,
      });
    } catch (blobError: any) {
      console.error("Vercel Blob error:", blobError);

      // For development, return a fallback
      return NextResponse.json({
        url: `https://placeholder.co/400x300?text=${encodeURIComponent(file.name)}`,
        fileType: file.type,
        originalName: file.name,
        error: blobError.message
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "File upload failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 