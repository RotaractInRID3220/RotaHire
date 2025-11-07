import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { loginSchema } from '@/schemas/authSchema';

// Handles user login authentication
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = loginSchema.parse(body);

    // Attempt login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { success: false, error: 'Please verify your email before logging in' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Check if user has completed company onboarding
    const { data: memberData, error: memberError } = await supabase
      .from('company_members')
      .select(`
        id,
        role,
        companies (
          id,
          company_name,
          status,
          is_verified
        )
      `)
      .eq('user_id', data.user.id)
      .single();

    let hasCompletedOnboarding = false;
    if (memberData && memberData.companies) {
      const company = memberData.companies;
      hasCompletedOnboarding = company.status === 'approved' && company.is_verified === true;
    }

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
        hasCompletedOnboarding,
        needsOnboarding: !hasCompletedOnboarding
      },
      message: 'Login successful'
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}