// API route for fetching single job details
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Fetch job with company details
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        responsibilities,
        requirements,
        flyer_url,
        field,
        mode,
        experience_level,
        location,
        country,
        city,
        salary_min,
        salary_max,
        salary_currency,
        is_salary_disclosed,
        accepts_direct_applications,
        external_application_url,
        created_at,
        company:companies(
          id,
          company_name,
          company_logo_url,
          industry,
          is_verified
        )
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedData = {
      id: data.id,
      title: data.title,
      description: data.description,
      responsibilities: data.responsibilities,
      requirements: data.requirements,
      flyerUrl: data.flyer_url,
      field: data.field,
      mode: data.mode,
      experienceLevel: data.experience_level,
      location: data.city || data.location || data.country || 'Remote',
      country: data.country,
      city: data.city,
      salary: data.is_salary_disclosed && data.salary_min && data.salary_max 
        ? {
            min: data.salary_min,
            max: data.salary_max,
            currency: data.salary_currency
          }
        : null,
      acceptsDirectApplications: data.accepts_direct_applications,
      externalApplicationUrl: data.external_application_url,
      company: {
        id: data.company?.id,
        name: data.company?.company_name || 'Unknown Company',
        logo: data.company?.company_logo_url,
        industry: data.company?.industry,
        verified: data.company?.is_verified || false
      },
      postedAt: data.created_at
    };

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('Error in GET job by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
