// src/app/api/jobs/create/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { completeJobSchema } from '@/schemas/jobSchema';

// Creates a new job posting and submits it for admin approval
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ...jobPayload } = body;
    
    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Validate request body
    const validatedData = completeJobSchema.parse(jobPayload);
    
    // Get company_id from company_members
    const { data: memberData, error: memberError } = await supabase
      .from('company_members')
      .select('company_id, role')
      .eq('user_id', userId)
      .single();
    
    if (memberError || !memberData) {
      return NextResponse.json(
        { success: false, error: 'Company not found for user' },
        { status: 404 }
      );
    }
    
    const companyId = memberData.company_id;
    
    // Calculate expires_at (default 90 days if not provided)
    let expiresAt = validatedData.application_deadline;
    if (!expiresAt) {
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 90);
      expiresAt = defaultExpiry.toISOString();
    }
    
    // Prepare job data - including all fields
    const jobData = {
      company_id: companyId,
      title: validatedData.title,
      description: validatedData.description,
      responsibilities: validatedData.responsibilities ? validatedData.responsibilities.join('\n') : null,
      requirements: validatedData.requirements ? validatedData.requirements.join('\n') : null,
      field: validatedData.field,
      experience_level: validatedData.experience_level,
      mode: validatedData.mode,
      country: validatedData.country || null,
      city: validatedData.city || null,
      salary_min: validatedData.min_salary || null,
      salary_max: validatedData.max_salary || null,
      salary_currency: validatedData.currency || 'LKR',
      is_salary_disclosed: validatedData.is_salary_disclosed || false,
      accepts_direct_applications: validatedData.application_method === 'direct' || true,
      external_application_url: validatedData.external_application_url || null,
      requires_github: validatedData.require_github || false,
      requires_linkedin: validatedData.require_linkedin || false,
      requires_portfolio: validatedData.require_portfolio || false,
      flyer_url: validatedData.job_flyer_url || null,
      expires_at: expiresAt,
      status: 'pending_approval',
      is_active: false,
      posted_by: userId
    };
    
    // Insert job into database
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();
    
    if (jobError) {
      console.error('Error creating job:', jobError);
      return NextResponse.json(
        { success: false, error: jobError.message },
        { status: 400 }
      );
    }
    
    // Insert job skills if table exists
    if (validatedData.skills && validatedData.skills.length > 0) {
      try {
        const skillsData = validatedData.skills.map(skill => ({
          job_id: job.id,
          skill_name: skill
        }));
        
        const { error: skillsError } = await supabase
          .from('job_skills')
          .insert(skillsData);
        
        if (skillsError) {
          console.warn('Could not insert skills (table might not exist):', skillsError.message);
          // Don't fail the whole request if skills table doesn't exist
        }
      } catch (skillsError) {
        console.warn('Skills insertion failed:', skillsError.message);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job created successfully and submitted for approval'
    });
    
  } catch (error) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error in job creation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
