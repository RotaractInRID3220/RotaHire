import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    // Create Supabase client with anon key for API route
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const {
      companyName,
      industry,
      companySize,
      website,
      description,
      contactName,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      zipCode,
      country,
      hiringNeeds,
      budgetRange,
      timeline,
      specialRequirements,
      userId,
    } = await request.json();

    // Validate required fields
    if (!companyName || !industry || !companySize || !contactName || !contactEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start a transaction-like operation
    // First, create the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        company_name: companyName,
        industry: industry,
        company_size: companySize,
        website: website || null,
        description: description,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address: address,
        city: city,
        state: state,
        zip_code: zipCode,
        country: country,
        hiring_needs: hiringNeeds,
        budget_range: budgetRange,
        timeline: timeline,
        special_requirements: specialRequirements || null,
        status: 'pending_approval', // Company needs admin approval
        is_verified: true, // Auto-verify for development
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      return NextResponse.json(
        { error: 'Failed to create company profile' },
        { status: 500 }
      );
    }

    // Then, create the company member relationship
    const { data: companyMember, error: memberError } = await supabase
      .from('company_members')
      .insert({
        user_id: userId,
        company_id: company.id,
        role: 'admin', // First user is admin
        status: 'active',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error creating company member:', memberError);
      // If member creation fails, we should clean up the company
      await supabase.from('companies').delete().eq('id', company.id);
      return NextResponse.json(
        { error: 'Failed to create company member relationship' },
        { status: 500 }
      );
    }

    // Update user profile with company information
    const { error: userUpdateError } = await supabase.auth.updateUser({
      data: {
        company_id: company.id,
        company_name: companyName,
        onboarding_completed: true,
      }
    });

    if (userUpdateError) {
      console.error('Error updating user profile:', userUpdateError);
      // This is not critical, so we don't fail the request
    }

    return NextResponse.json({
      success: true,
      message: 'Company setup completed successfully',
      data: {
        company: {
          id: company.id,
          name: company.company_name,
          status: company.status,
        },
        member: {
          id: companyMember.id,
          role: companyMember.role,
          status: companyMember.status,
        },
      },
    });

  } catch (error) {
    console.error('Setup company member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}