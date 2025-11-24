/**
 * Job Application Service
 * Handles job application submission
 */

/**
 * Submit a job application
 * @param {string} jobId - Job ID
 * @param {Object} applicationData - Application data
 * @returns {Promise<Object>} Application result
 */
export const submitApplication = async (jobId, applicationData) => {
  try {
    const response = await fetch(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(applicationData)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to submit application');
    }

    return result.data;

  } catch (error) {
    console.error('[Application Service] Submit error:', error);
    throw error;
  }
};

/**
 * Check if user has already applied to a job
 * @param {string} jobId - Job ID
 * @param {string} rmisId - User's RMIS ID
 * @returns {Promise<boolean>} True if already applied
 */
export const checkExistingApplication = async (jobId, rmisId) => {
  try {
    // This would need a separate API endpoint
    // For now, the duplicate check happens in the submit endpoint
    return false;
  } catch (error) {
    console.error('[Application Service] Check error:', error);
    return false;
  }
};
