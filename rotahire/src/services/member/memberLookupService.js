/**
 * Member Lookup Service
 * Handles member verification through DBMID API
 */

/**
 * Search for Rotaract members by RMIS ID or NIC
 * @param {Object} searchData - Search parameters
 * @param {string} searchData.rmisId - RMIS ID (membership_id)
 * @param {string} searchData.nic - NIC (nic_pp)
 * @returns {Promise<Array>} Array of matching members
 */
export const searchMembers = async (searchData) => {
  try {
    const params = new URLSearchParams();
    
    if (searchData.rmisId) {
      params.append('rmisId', searchData.rmisId);
    }
    
    if (searchData.nic) {
      params.append('nic', searchData.nic);
    }

    const response = await fetch(`/api/member-lookup?${params}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to search members');
    }

    return result.members || [];

  } catch (error) {
    console.error('[Member Lookup Service] Search error:', error);
    throw error;
  }
};

/**
 * Verify if a member exists by RMIS ID
 * @param {string} rmisId - RMIS ID to verify
 * @returns {Promise<Object|null>} Member data or null if not found
 */
export const verifyMemberByRMIS = async (rmisId) => {
  try {
    const members = await searchMembers({ rmisId });
    return members.length > 0 ? members[0] : null;
  } catch (error) {
    console.error('[Member Lookup Service] Verify error:', error);
    throw error;
  }
};

/**
 * Verify if a member exists by NIC
 * @param {string} nic - NIC to verify
 * @returns {Promise<Object|null>} Member data or null if not found
 */
export const verifyMemberByNIC = async (nic) => {
  try {
    const members = await searchMembers({ nic });
    return members.length > 0 ? members[0] : null;
  } catch (error) {
    console.error('[Member Lookup Service] Verify error:', error);
    throw error;
  }
};
