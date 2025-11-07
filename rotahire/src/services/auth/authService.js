// src/services/auth/authService.js
import { supabase } from '@/lib/supabaseClient';

// Handles user authentication operations with Supabase
export const signupUser = async (userData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
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

// Handles user login with Supabase
export const loginUser = async (loginData) => {
  try {
    // Use client-side Supabase auth for proper session management
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Just return the user and session - redirect to dashboard happens in login component
    // Dashboard will handle onboarding validation
    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    throw error;
  }
};

// Checks if user has completed company onboarding
export const checkCompanyOnboarding = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch('/api/auth/check-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
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

// Resends verification email to user
export const resendVerificationEmail = async (email) => {
  try {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
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