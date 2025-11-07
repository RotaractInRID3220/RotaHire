import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Checks if user has completed company onboarding
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Invalid JSON in request body:', jsonError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user has a company membership
    const { data: memberData, error: memberError } = await supabase
      .from('company_members')
      .select(`
        id,
        role,
        companies (
          id,
          company_name,
          company_logo_url,
          status,
          is_verified
        )
      `)
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to handle 0 results gracefully

    console.log('Check company for userId:', userId);
    console.log('Member data:', memberData);
    console.log('Member error:', memberError);

    if (memberError && memberError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking company membership:', memberError);
      return NextResponse.json(
        { success: false, error: 'Failed to check company status' },
        { status: 500 }
      );
    }

    // If no company membership found, user hasn't completed onboarding
    if (!memberData) {
      console.log('No company membership found for user:', userId);

      return NextResponse.json({
        success: true,
        data: {
          hasCompany: false,
          needsOnboarding: true
        }
      });
    }

    // Check if company is approved and verified
    const company = memberData.companies;
    const isCompanyComplete = company &&
                             (company.status === 'approved' || company.status === 'pending_approval') &&
                             company.is_verified === true;

    return NextResponse.json({
      success: true,
      data: {
        hasCompany: true,
        needsOnboarding: !isCompanyComplete,
        company: company,
        membership: {
          id: memberData.id,
          role: memberData.role
        }
      }
    });

  } catch (error) {
    console.error('Check company onboarding error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}