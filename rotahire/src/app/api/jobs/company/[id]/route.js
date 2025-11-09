// src/app/api/jobs/company/[id]/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Fetches detailed information for a specific company job
export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = (await params).id;

    // Validate userId and jobId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
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

    // Fetch detailed job information with company data
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company:companies(
          id,
          company_name,
          company_logo_url,
          company_website,
          company_email,
          industry,
          description,
          is_verified
        ),
        job_skills(
          skill_name
        ),
        job_reviews(
          id,
          action,
          feedback,
          created_at,
          admin_users!inner(
            rmis_id,
            first_name,
            last_name
          )
        )
      `)
      .eq('id', jobId)
      .eq('company_id', companyId)
      .single();

    if (error || !data) {
      console.error('Error fetching job details:', error);
      return NextResponse.json(
        { success: false, error: 'Job not found or access denied' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedData = {
      ...data,
      skills: data.job_skills?.map(js => js.skill_name).filter(Boolean) || [],
      company_name: data.company?.company_name || 'Unknown Company',
      company_logo_url: data.company?.company_logo_url,
      company_website: data.company?.company_website,
      company_email: data.company?.company_email,
      company_industry: data.company?.industry,
      company_description: data.company?.description,
      company_verified: data.company?.is_verified || false,
      // Add computed status for UI
      display_status: getDisplayStatus(data.status, data.is_active),
      // Add review history
      review_history: data.job_reviews?.map(review => ({
        id: review.id,
        action: review.action,
        feedback: review.feedback,
        created_at: review.created_at,
        admin_name: review.admin_users ? `${review.admin_users.first_name} ${review.admin_users.last_name}` : 'Unknown Admin',
        admin_rmis_id: review.admin_users?.rmis_id
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []
    };

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('Error in GET company job details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update job details
export async function PATCH(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = (await params).id;

    // Validate userId and jobId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
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

    // Verify job belongs to company and can be edited
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

    // Only allow editing for draft or rejected jobs
    if (!['draft', 'rejected', 'pending_approval'].includes(jobData.status)) {
      return NextResponse.json(
        { success: false, error: 'Only draft, rejected, or pending approval jobs can be edited' },
        { status: 400 }
      );
    }

    // Get update data from request
    const updateData = await request.json();

    // Validate required fields
    if (!updateData.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Job title is required' },
        { status: 400 }
      );
    }

    if (!updateData.description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (!updateData.requirements) {
      return NextResponse.json(
        { success: false, error: 'Job requirements are required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const jobUpdateData = {
      title: updateData.title.trim(),
      description: updateData.description.trim(),
      requirements: Array.isArray(updateData.requirements)
        ? updateData.requirements.join('\n')
        : (typeof updateData.requirements === 'string'
          ? updateData.requirements
          : updateData.requirements.split('\n').filter(r => r.trim()).join('\n')),
      location: updateData.location?.trim() || null,
      city: updateData.city?.trim() || null,
      country: updateData.country?.trim() || null,
      mode: updateData.mode,
      experience_level: updateData.experience_level,
      salary_min: updateData.salary_min || null,
      salary_max: updateData.salary_max || null,
      salary_currency: updateData.salary_currency || 'LKR',
      field: updateData.field,
      flyer_url: updateData.flyer_url?.trim() || null,
      updated_at: new Date().toISOString()
    };

    // Update job
    const { data, error } = await supabase
      .from('jobs')
      .update(jobUpdateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update job' },
        { status: 500 }
      );
    }

    // Update skills if provided
    if (updateData.skills && Array.isArray(updateData.skills)) {
      // First delete existing skills
      await supabase
        .from('job_skills')
        .delete()
        .eq('job_id', jobId);

      // Insert new skills
      if (updateData.skills.length > 0) {
        const skillsData = updateData.skills.map(skillName => ({
          job_id: jobId,
          skill_name: skillName.trim()
        }));

        const { error: skillsError } = await supabase
          .from('job_skills')
          .insert(skillsData);

        if (skillsError) {
          console.error('Error updating skills:', skillsError);
          // Don't fail the whole operation for skills error
        }
      }
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Error in PATCH company job:', error);
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