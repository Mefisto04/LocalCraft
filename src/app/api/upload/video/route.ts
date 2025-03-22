import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

// Maximum video file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    console.log("Video upload API called");

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

    // Check if the file is a video
    if (!file.type.startsWith('video/')) {
      console.log(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: "The file must be a video" },
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

    // Generate a unique filename
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}-${file.name}`;
    console.log(`Generated filename: ${fileName}`);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not set");
      return NextResponse.json({
        url: `https://placeholder.co/400x300?text=${encodeURIComponent(file.name)}`,
        fileType: file.type,
        originalName: file.name
      });
    }

    try {
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
      throw blobError;
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