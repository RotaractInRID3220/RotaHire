/**
 * DBMID API Service
 * Centralized service for interacting with DBMID (Rotaract Database Management Information Database)
 */

const DBMID_API_URL = 'https://info.rotaract3220.org/api/query';
const DBMID_API_KEY = process.env.NEXT_PUBLIC_DBMID_API_KEY;

/**
 * Fetch user data by username from DBMID
 * @param {string} username - The username to search for
 * @returns {Promise<Object|null>} User data or null if not found
 */
export async function getUserByUsername(username) {
  try {
    const response = await fetch(DBMID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DBMID_API_KEY
      },
      body: JSON.stringify({
        sql: 'SELECT * FROM club_membership_data WHERE m_username = ? LIMIT 1',
        params: [username]
      })
    });

    if (!response.ok) {
      throw new Error(`DBMID API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    return data.results[0];
  } catch (error) {
    console.error('[DBMID Service] Error fetching user by username:', error);
    throw error;
  }
}

/**
 * Fetch all active members of a club
 * @param {string|number} clubId - The club ID to fetch members for
 * @returns {Promise<Array>} Array of club members
 */
export async function getClubMembers(clubId) {
  try {
    const response = await fetch(DBMID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DBMID_API_KEY
      },
      body: JSON.stringify({
        sql: 'SELECT * FROM club_membership_data WHERE club_id = ? AND status IN (1, 3, 5)',
        params: [clubId]
      })
    });

    if (!response.ok) {
      throw new Error(`DBMID API error: ${response.status}`);
    }

    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.error('[DBMID Service] Error fetching club members:', error);
    throw error;
  }
}

/**
 * Verify MD5 password hash
 * @param {string} password - Plain text password
 * @param {string} hash - MD5 hash from database
 * @returns {boolean} True if password matches
 */
export function verifyPassword(password, hash) {
  const { createHash } = require('crypto');
  const passwordHash = createHash('md5').update(password).digest('hex');
  return passwordHash.toLowerCase() === hash.toLowerCase();
}