// Company job management service for handling job operations
import { toast } from 'sonner';

// Creates a new job posting
export const createJob = async (userId, jobData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        ...jobData
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

// Fetches all jobs for the authenticated company with optional status filter
export const getCompanyJobs = async (userId, status = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const url = status
      ? `/api/jobs/company?status=${status}&userId=${userId}`
      : `/api/jobs/company?userId=${userId}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

// Updates job active status (for approved jobs only)
export const updateJobStatus = async (userId, jobId, isActive) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch('/api/jobs/company', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        isActive,
        userId
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

// Deletes a job (only if in draft or rejected status)
export const deleteJob = async (userId, jobId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch(`/api/jobs/company?jobId=${jobId}&userId=${userId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

// Fetches detailed information for a specific company job
export const getCompanyJobDetails = async (userId, jobId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const response = await fetch(`/api/jobs/company/${jobId}?userId=${userId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

// Updates job details (for draft, rejected, or pending approval jobs)
export const updateJobDetails = async (userId, jobId, updateData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const response = await fetch(`/api/jobs/company/${jobId}?userId=${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};