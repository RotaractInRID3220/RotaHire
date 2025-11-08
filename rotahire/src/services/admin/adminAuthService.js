// Admin authentication service using NextAuth credentials provider
// Handles login, logout, and session management for admin portal

import { signIn, signOut } from 'next-auth/react';

/**
 * Signs in admin user with username and password
 * Uses NextAuth credentials provider with DBMID API
 * 
 * @param {string} username - Admin username from DBMID
 * @param {string} password - Admin password
 * @returns {Promise} NextAuth signin result
 */
export const adminSignIn = async (username, password) => {
  try {
    const result = await signIn('admin-credentials', {
      username,
      password,
      redirect: false
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    throw new Error(error.message || 'Admin sign in failed');
  }
};

/**
 * Signs out admin user and clears session
 * @returns {Promise} NextAuth signout result
 */
export const adminSignOut = async () => {
  try {
    await signOut({ redirect: false });
  } catch (error) {
    console.error('Error during admin sign out:', error);
    throw error;
  }
};

/**
 * Validates admin credentials through DBMID API
 * Used for client-side validation before submission
 * 
 * @param {string} username - Admin username
 * @returns {Promise} User data or null if not found
 */
export const validateAdminUsername = async (username) => {
  try {
    const response = await fetch('/api/council', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    return data.success ? data.memberData : null;
  } catch (error) {
    throw new Error(error.message || 'Validation failed');
  }
};
