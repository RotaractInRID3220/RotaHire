import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET: Fetch jobs for admin review with optional status filter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = supabase
      .from('jobs')
      .select(`
        *,
        company:companies(
          id,
          company_name,
          company_logo_url,
          industry,
          is_verified
        ),
        job_skills(
          skill_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transformedData = data.map(job => ({
      ...job,
      skills: job.job_skills?.map(js => js.skill_name).filter(Boolean) || [],
      company_name: job.company?.company_name || 'Unknown Company',
      company_logo: job.company?.company_logo_url,
      company_industry: job.company?.industry,
      company_verified: job.company?.is_verified || false
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      total: transformedData.length
    });

  } catch (error) {
    console.error('Error in GET jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}