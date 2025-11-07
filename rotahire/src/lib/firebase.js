// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  // Only include messaging if explicitly configured
  ...(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_ID && {
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_ID,
  }),
};

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
  throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is required');
}

const app = initializeApp(firebaseConfig);

// Explicitly initialize storage with the bucket URL from env
// This ensures we're using the correct bucket: gs://rotahire-53382.firebasestorage.app
export const storage = getStorage(app, `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`);