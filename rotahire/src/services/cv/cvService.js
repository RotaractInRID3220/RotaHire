/**
 * CV Management Service
 * Handles CV uploads, listing, and snapshot creation in Firebase Storage
 * Also manages CV records in Supabase database
 */

import { storage } from '@/lib/firebase';
import { supabase } from '@/lib/supabaseClient';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata
} from 'firebase/storage';

/**
 * Upload a CV file to Firebase Storage and create database record
 * @param {File} file - The CV file to upload
 * @param {string} rmisId - User's RMIS ID
 * @param {number} slotNumber - CV slot number (1, 2, or 3)
 * @param {string} label - Optional label for the CV (e.g., "Software Engineer Resume")
 * @returns {Promise<Object>} CV record with id, url, and metadata
 */
export const uploadCV = async (file, rmisId, slotNumber, label = null) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error('File size must be less than 5MB');
    }

    if (![1, 2, 3].includes(slotNumber)) {
      throw new Error('Slot number must be 1, 2, or 3');
    }

    // Create storage path
    const timestamp = Date.now();
    const filePath = `cvs/${rmisId}_${slotNumber}.pdf`;
    const storageRef = ref(storage, filePath);

    // Upload file to Firebase
    await uploadBytes(storageRef, file, {
      contentType: 'application/pdf',
      customMetadata: {
        rmisId,
        slotNumber: slotNumber.toString(),
        uploadedAt: new Date().toISOString()
      }
    });

    // Get download URL
    const url = await getDownloadURL(storageRef);

    // Check if CV record exists for this slot
    const { data: existingCV } = await supabase
      .from('cvs')
      .select('id')
      .eq('rmis_id', rmisId)
      .eq('firebase_storage_path', filePath)
      .single();

    if (existingCV) {
      // Update existing record
      const { data: updatedCV, error } = await supabase
        .from('cvs')
        .update({
          label: label,
          original_filename: file.name,
          file_size_bytes: file.size,
          is_active: true,
          upload_count: supabase.raw('upload_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCV.id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: updatedCV.id,
        url,
        path: filePath,
        slotNumber,
        label: updatedCV.label,
        fileName: file.name,
        fileSize: file.size
      };
    } else {
      // Create new CV record
      const { data: newCV, error } = await supabase
        .from('cvs')
        .insert({
          rmis_id: rmisId,
          user_id: null, // No auth user for this flow
          firebase_storage_path: filePath,
          label: label,
          original_filename: file.name,
          file_size_bytes: file.size,
          mime_type: 'application/pdf',
          is_active: true,
          upload_count: 1
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: newCV.id,
        url,
        path: filePath,
        slotNumber,
        label: newCV.label,
        fileName: file.name,
        fileSize: file.size
      };
    }

  } catch (error) {
    console.error('[CV Service] Upload error:', error);
    throw error;
  }
};

/**
 * List all CVs for a user from database
 * @param {string} rmisId - User's RMIS ID
 * @returns {Promise<Array>} Array of CV objects with metadata
 */
export const listUserCVs = async (rmisId) => {
  try {
    const { data: cvs, error } = await supabase
      .from('cvs')
      .select('*')
      .eq('rmis_id', rmisId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get download URLs for each CV
    const cvsWithUrls = await Promise.all(
      cvs.map(async (cv, index) => {
        try {
          const storageRef = ref(storage, cv.firebase_storage_path);
          const url = await getDownloadURL(storageRef);
          
          // Extract slot number from path (cvs/{rmisId}_{slot}.pdf)
          const slotMatch = cv.firebase_storage_path.match(/_(\d)\.pdf$/);
          const slotNumber = slotMatch ? parseInt(slotMatch[1]) : index + 1;

          return {
            id: cv.id,
            slotNumber,
            url,
            path: cv.firebase_storage_path,
            label: cv.label,
            fileName: cv.original_filename,
            fileSize: cv.file_size_bytes,
            uploadedAt: cv.created_at
          };
        } catch (error) {
          console.error(`Failed to get URL for CV ${cv.id}:`, error);
          return null;
        }
      })
    );

    return cvsWithUrls.filter(cv => cv !== null);

  } catch (error) {
    console.error('[CV Service] List CVs error:', error);
    throw error;
  }
};

/**
 * Delete a CV from Firebase and mark as inactive in database
 * @param {string} cvId - CV database ID (UUID)
 */
export const deleteCV = async (cvId) => {
  try {
    // Get CV record
    const { data: cv, error: fetchError } = await supabase
      .from('cvs')
      .select('firebase_storage_path')
      .eq('id', cvId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from Firebase
    const storageRef = ref(storage, cv.firebase_storage_path);
    await deleteObject(storageRef);

    // Mark as inactive in database
    const { error: updateError } = await supabase
      .from('cvs')
      .update({ is_active: false })
      .eq('id', cvId);

    if (updateError) throw updateError;

  } catch (error) {
    console.error('[CV Service] Delete error:', error);
    throw error;
  }
};

/**
 * Create a snapshot of a CV for an application
 * Copies the CV to a permanent application-specific location
 * @param {string} cvUrl - Original CV URL
 * @param {string} cvPath - Original CV storage path
 * @param {string} applicationId - UUID of the application
 * @returns {Promise<string>} Snapshot storage path
 */
export const createCVSnapshot = async (cvUrl, cvPath, applicationId) => {
  try {
    // Download the original CV blob
    const response = await fetch(cvUrl);
    const blob = await response.blob();

    // Create snapshot reference
    const snapshotPath = `applications/${applicationId}.pdf`;
    const snapshotRef = ref(storage, snapshotPath);

    // Upload snapshot
    await uploadBytes(snapshotRef, blob, {
      contentType: 'application/pdf',
      customMetadata: {
        originalPath: cvPath,
        applicationId,
        snapshotCreatedAt: new Date().toISOString()
      }
    });

    return snapshotPath;

  } catch (error) {
    console.error('[CV Service] Snapshot creation error:', error);
    throw error;
  }
};
