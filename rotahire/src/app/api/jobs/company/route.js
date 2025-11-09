// src/app/api/jobs/company/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Fetches all jobs for the authenticated company user with optional status filter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get company_id from company_members
    const { data: memberData, error: memberError } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', userId)
      .single();

    if (memberError || !memberData) {
      return NextResponse.json(
        { success: false, error: 'Company not found for user' },
        { status: 404 }
      );
    }

    const companyId = memberData.company_id;

    // Build query for company jobs
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
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status) {
      if (status === 'approved-live') {
        // Approved and active jobs
        query = query.eq('status', 'approved').eq('is_active', true);
      } else if (status === 'approved-closed') {
        // Approved but closed jobs
        query = query.eq('status', 'approved').eq('is_active', false);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching company jobs:', error);
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
      company_verified: job.company?.is_verified || false,
      // Add computed status for UI
      display_status: getDisplayStatus(job.status, job.is_active)
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      total: transformedData.length
    });

  } catch (error) {
    console.error('Error in GET company jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to determine display status
function getDisplayStatus(status, isActive) {
  if (status === 'approved') {
    return isActive ? 'approved-live' : 'approved-closed';
  }
  return status;
}

// PATCH: Update job status (activate/deactivate approved jobs)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { jobId, isActive, userId } = body;

    if (!jobId || typeof isActive !== 'boolean' || !userId) {
      return NextResponse.json(
        { success: false, error: 'Job ID, isActive status, and userId are required' },
        { status: 400 }
      );
    }

    // Get company_id from company_members
    const { data: memberData, error: memberError } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', userId)
      .single();

    if (memberError || !memberData) {
      return NextResponse.json(
        { success: false, error: 'Company not found for user' },
        { status: 404 }
      );
    }

    const companyId = memberData.company_id;

    // Verify job belongs to company and is approved
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('status, company_id')
      .eq('id', jobId)
      .eq('company_id', companyId)
      .single();

    if (jobError || !jobData) {
      return NextResponse.json(
        { success: false, error: 'Job not found or access denied' },
        { status: 404 }
      );
    }

    if (jobData.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Only approved jobs can be activated/deactivated' },
        { status: 400 }
      );
    }

    // Update job active status
    const { data, error } = await supabase
      .from('jobs')
      .update({ is_active: isActive })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job status:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update job status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Job ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Error in PATCH company job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a job (only if in draft or rejected status)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const userId = searchParams.get('userId');

    if (!jobId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Job ID and userId are required' },
        { status: 400 }
      );
    }

    // Get company_id from company_members
    const { data: memberData, error: memberError } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', userId)
      .single();

    if (memberError || !memberData) {
      return NextResponse.json(
        { success: false, error: 'Company not found for user' },
        { status: 404 }
      );
    }

    const companyId = memberData.company_id;

    // Verify job belongs to company and can be deleted
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('status, company_id')
      .eq('id', jobId)
      .eq('company_id', companyId)
      .single();

    if (jobError || !jobData) {
      return NextResponse.json(
        { success: false, error: 'Job not found or access denied' },
        { status: 404 }
      );
    }

    if (!['draft', 'rejected'].includes(jobData.status)) {
      return NextResponse.json(
        { success: false, error: 'Only draft or rejected jobs can be deleted' },
        { status: 400 }
      );
    }

    // Delete job
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE company job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}