import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';

// POST: Approve a job posting
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { jobId, feedback } = await request.json();

    // Validate required fields
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get admin RMIS ID from session
    const adminRmisId = session.user.userDeets?.membership_id;
    
    if (!adminRmisId) {
      return NextResponse.json(
        { success: false, error: 'Admin information not found in session' },
        { status: 401 }
      );
    }

    // Check if job exists and is pending approval
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, title, company_id')
      .eq('id', jobId)
      .eq('status', 'pending_approval')
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found or not pending approval' },
        { status: 404 }
      );
    }

    // Update job status to approved
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'approved',
        is_active: true,
        reviewed_by: adminRmisId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job status:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to approve job' },
        { status: 500 }
      );
    }

    // Create review record
    const { error: reviewError } = await supabase
      .from('job_reviews')
      .insert({
        job_id: jobId,
        admin_rmis_id: adminRmisId,
        action: 'approved',
        feedback: feedback || null,
        created_at: new Date().toISOString()
      });

    if (reviewError) {
      console.error('Error creating review record:', reviewError);
      // Don't fail the whole operation for review error
    }

    // TODO: Send notification email to company

    return NextResponse.json({
      success: true,
      message: 'Job approved successfully',
      data: {
        job_id: jobId,
        status: 'approved'
      }
    });

  } catch (error) {
    console.error('Error in approve job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}