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

// ==========================================
// PUBLIC JOB SEARCH SERVICES
// ==========================================

// Fetches public jobs (approved and active) with optional filters and search
export const getPublicJobs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add pagination
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    // Add search
    if (filters.search) params.append('search', filters.search);
    
    // Add filters
    if (filters.field) params.append('field', filters.field);
    if (filters.mode) params.append('mode', filters.mode);
    if (filters.experience) params.append('experience', filters.experience);
    if (filters.location) params.append('location', filters.location);

    const response = await fetch(`/api/jobs?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    throw error;
  }
};

// Search jobs with a query string
export const searchJobs = async (searchQuery, page = 1) => {
  try {
    return await getPublicJobs({
      search: searchQuery,
      page,
      limit: 12
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};

// Fetches a single job by ID
export const getJobById = async (jobId) => {
  try {
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const response = await fetch(`/api/jobs/${jobId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    throw error;
  }
};