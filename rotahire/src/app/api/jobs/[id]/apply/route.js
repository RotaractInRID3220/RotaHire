import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createCVSnapshot } from '@/services/cv/cvService';
import { storage } from '@/lib/firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';

/**
 * API endpoint for job application submission
 * Creates application record with CV snapshot
 * 
 * POST /api/jobs/[id]/apply
 */
export async function POST(request, { params }) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();

    const {
      membershipId,
      fullName,
      preferredName,
      email,
      mobile,
      countryCode,
      nic,
      clubId,
      cvId,
      cvUrl,
      cvPath,
      linkedinUrl,
      githubUrl,
      portfolioUrl
    } = body;

    // Validate required fields
    if (!membershipId || !fullName || !email || !mobile || !cvId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if job exists and is available
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, is_active, company_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('[Application] Job fetch error:', jobError);
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Allow applications for draft, active, pending_review, and approved jobs
    const allowedStatuses = ['draft', 'active', 'pending_review', 'approved'];
    if (!allowedStatuses.includes(job.status) || !job.is_active) {
      console.warn('[Application] Job not accepting applications:', { 
        jobId, 
        status: job.status, 
        is_active: job.is_active 
      });
      return NextResponse.json(
        { success: false, error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check for duplicate application
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_rmis_id', membershipId)
      .single();

    if (existingApp) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Fetch CV details from database
    const { data: cvRecord, error: cvError } = await supabase
      .from('cvs')
      .select('firebase_storage_path, original_filename')
      .eq('id', cvId)
      .eq('is_active', true)
      .single();

    if (cvError || !cvRecord) {
      console.error('[Application] CV fetch error:', cvError);
      return NextResponse.json(
        { success: false, error: 'Invalid CV selected' },
        { status: 400 }
      );
    }

    // Create application record
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        user_id: null, // No auth user for this flow
        club_id: clubId,
        applicant_name: fullName,
        applicant_email: email,
        applicant_mobile: `${countryCode}${mobile}`,
        applicant_rmis_id: membershipId,
        cv_id: cvId, // Reference to CV record
        applicant_linkedin_url: linkedinUrl,
        applicant_github_url: githubUrl,
        applicant_portfolio_url: portfolioUrl,
        status: 'submitted',
        applied_at: new Date().toISOString()
      })
      .select()
      .single();

    if (appError) {
      console.error('[Application] Database error:', appError);
      return NextResponse.json(
        { success: false, error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    // Create CV snapshot and update application
    try {
      // Get download URL from Firebase
      const cvRef = storageRef(storage, cvRecord.firebase_storage_path);
      const cvUrl = await getDownloadURL(cvRef);

      const snapshotPath = await createCVSnapshot(cvUrl, cvRecord.firebase_storage_path, application.id);

      // Update application with snapshot path
      await supabase
        .from('applications')
        .update({ cv_snapshot_path: snapshotPath })
        .eq('id', application.id);

      // Update CV last_used_at
      await supabase
        .from('cvs')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', cvId);

    } catch (snapshotError) {
      console.error('[Application] Snapshot error:', snapshotError);
      // Continue without snapshot if it fails
    }

    return NextResponse.json({
      success: true,
      data: {
        applicationId: application.id,
        message: 'Application submitted successfully'
      }
    });

  } catch (error) {
    console.error('[Application] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
