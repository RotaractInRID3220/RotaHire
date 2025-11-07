import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_name,
      company_email,
      company_website,
      company_logo_url,
      industry,
      company_size,
      description,
      contact_person_name,
      contact_person_email,
      contact_person_mobile,
      contact_person_designation,
      country,
      city,
      address,
      user_id
    } = body;

    console.log('Onboarding API received company_logo_url:', company_logo_url);

    // Validate that logo URL is not base64 data
    if (company_logo_url && company_logo_url.startsWith('data:')) {
      console.error('Received base64 data URL for logo, rejecting');
      return NextResponse.json(
        { error: 'Invalid logo URL format' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!company_name || !company_email || !industry || !company_size ||
        !contact_person_name || !contact_person_email || !contact_person_designation ||
        !country || !city || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';

    // Insert company data
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([{
        company_name,
        company_email,
        company_website: company_website || null,
        company_logo_url: company_logo_url || null,
        industry,
        company_size,
        description,
        contact_person_name,
        contact_person_email,
        contact_person_mobile: contact_person_mobile || null,
        contact_person_designation,
        country,
        city,
        address: address || null,
        signup_ip_address: ip,
        last_login_at: new Date().toISOString(),
        status: 'approved',
        is_verified: true
      }])
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      return NextResponse.json(
        { error: 'Failed to create company profile' },
        { status: 500 }
      );
    }

    // Insert company member (current user as owner)
    const { error: memberError } = await supabase
      .from('company_members')
      .insert([{
        company_id: companyData.id,
        user_id,
        role: 'owner',
        can_post_jobs: true,
        can_view_applications: true,
        can_manage_team: true
      }]);

    if (memberError) {
      console.error('Company member creation error:', memberError);
      // Clean up the company record if member creation fails
      await supabase.from('companies').delete().eq('id', companyData.id);
      return NextResponse.json(
        { error: 'Failed to create company member record' },
        { status: 500 }
      );
    }

    // Update user metadata to mark onboarding as completed
    const { error: userUpdateError } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        company_id: companyData.id,
        company_name: company_name
      }
    });

    if (userUpdateError) {
      console.error('Error updating user metadata:', userUpdateError);
      // This is not critical for the onboarding success, so we continue
    }

    return NextResponse.json({
      success: true,
      company: companyData,
      message: 'Company profile created successfully'
    });

  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}