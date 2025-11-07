import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Upload image to Firebase Storage
export async function uploadImageToFirebase(file, folder = 'company-logos') {
  try {
    console.log('Starting Firebase upload for file:', file.name, 'size:', file.size);

    // Validate file
    if (!file || !file.name) {
      throw new Error('Invalid file provided');
    }

    // Create a unique filename with timestamp and random string for uniqueness
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomId}.${fileExtension}`;
    console.log('Upload path:', fileName);

    // Create a reference to the file location
    const storageRef = ref(storage, fileName);
    console.log('Storage reference created for:', storageRef.fullPath);

    // Upload the file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'uploadedBy': 'rotaHire-onboarding',
        'originalName': file.name
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('Upload snapshot:', {
      bytesTransferred: snapshot.bytesTransferred,
      totalBytes: snapshot.totalBytes,
      state: snapshot.state
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL generated:', downloadURL);

    // Validate that we got a proper Firebase Storage URL
    if (!downloadURL || !downloadURL.includes('firebasestorage.googleapis.com')) {
      throw new Error('Invalid download URL received from Firebase: ' + downloadURL);
    }

    console.log('Firebase upload completed successfully');
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      serverResponse: error.serverResponse
    });
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}
