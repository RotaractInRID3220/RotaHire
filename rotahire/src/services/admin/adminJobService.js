// Admin job management service for handling job approvals and rejections
import { toast } from 'sonner';

// Fetches all jobs pending admin approval
export const getPendingJobs = async () => {
  try {
    const response = await fetch('/api/admin/jobs?status=pending_approval');
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};

// Fetches all jobs with optional status filter
export const getAllJobs = async (status = null) => {
  try {
    const url = status ? `/api/admin/jobs?status=${status}` : '/api/admin/jobs';
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

// Approves a job posting
export const approveJob = async (jobId, feedback = null) => {
  try {
    const response = await fetch('/api/admin/jobs/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        feedback
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to approve job');
    }

    return result.data;
  } catch (error) {
    console.error('Approve job error:', error);
    throw error;
  }
};

// Rejects a job posting with feedback
export const rejectJob = async (jobId, feedback) => {
  try {
    const response = await fetch('/api/admin/jobs/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        feedback
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to reject job');
    }

    return result.data;
  } catch (error) {
    console.error('Reject job error:', error);
    throw error;
  }
};

// Requests revision for a job posting
export const requestRevision = async (jobId, feedback) => {
  try {
    const response = await fetch('/api/admin/jobs/revision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        feedback
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to request revision');
    }

    return result.data;
  } catch (error) {
    console.error('Request revision error:', error);
    throw error;
  }
};

// Fetches detailed job information for review
export const getJobDetails = async (jobId) => {
  try {
    const response = await fetch(`/api/admin/jobs/${jobId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    throw error;
  }
};