// src/app/api/jobs/upload-flyer/route.js
import { NextResponse } from 'next/server';

// Handles job flyer upload to Firebase Storage
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }
    
    // Validate file size (3MB max)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 3MB limit' },
        { status: 400 }
      );
    }
    
    // Convert file to base64 for client-side Firebase upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    
    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64Data: base64
      },
      message: 'File validated successfully'
    });
    
  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
