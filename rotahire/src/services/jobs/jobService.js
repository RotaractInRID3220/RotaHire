// src/services/jobs/jobService.js
import { supabase } from '@/lib/supabaseClient';

// Creates a new job posting
export const createJob = async (jobData) => {
  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    
    const response = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...jobData })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create job');
    }
    
    return result.data;
  } catch (error) {
    throw error;
  }
};

// Validates and prepares file for upload
export const validateJobFlyer = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/jobs/upload-flyer', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to validate file');
    }
    
    return result.data;
  } catch (error) {
    throw error;
  }
};
