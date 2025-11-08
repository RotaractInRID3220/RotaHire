import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET: Fetch detailed job information for admin review
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company:companies(
          id,
          company_name,
          company_logo_url,
          industry,
          description,
          company_website,
          city,
          country,
          is_verified,
          created_at
        ),
        job_skills(
          skill_name
        ),
        job_reviews(
          id,
          admin_rmis_id,
          action,
          feedback,
          created_at,
          admin_users!job_reviews_admin_rmis_id_fkey (
            first_name,
            last_name,
            role
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job details:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch job details' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Transform data for frontend - keep structure consistent with what the page expects
    const transformedData = {
      ...data,
      company: data.company,  // Keep company as-is so the page can use jobDetails.company
      job_skills: data.job_skills || []  // Keep original structure
    };

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('Error in GET job details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}