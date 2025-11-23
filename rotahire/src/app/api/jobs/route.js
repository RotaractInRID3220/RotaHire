// src/app/api/jobs/route.js
// Public API endpoint for fetching approved and active jobs with filtering and search
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Search query (searches across title, description, company name)
    const search = searchParams.get('search')?.trim() || '';
    
    // Filters
    const field = searchParams.get('field'); // job_field enum
    const mode = searchParams.get('mode'); // job_mode enum
    const experienceLevel = searchParams.get('experience'); // experience_level enum
    const location = searchParams.get('location')?.trim(); // city or country

    // Build base query - only approved and active jobs
    let query = supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
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
      `, { count: 'exact' })
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply search filter (across title, description, and company name)
    if (search) {
      // Use textSearch or ilike for partial matching
      // Note: This searches title and description. Company name filtering is done post-fetch
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply field filter
    if (field) {
      query = query.eq('field', field);
    }

    // Apply mode filter
    if (mode) {
      query = query.eq('mode', mode);
    }

    // Apply experience level filter
    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }

    // Apply location filter (searches both city and country)
    if (location) {
      query = query.or(`city.ilike.%${location}%,country.ilike.%${location}%`);
    }

    // Execute query with pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching public jobs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    // Additional filtering for company name in search (since we can't do nested search in Supabase easily)
    let filteredData = data || [];
    if (search) {
      filteredData = filteredData.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.company_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Transform data for frontend
    const transformedData = filteredData.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      field: job.field,
      mode: job.mode,
      experienceLevel: job.experience_level,
      location: job.city || job.location || job.country || 'Remote',
      country: job.country,
      city: job.city,
      salary: job.is_salary_disclosed && job.salary_min && job.salary_max 
        ? {
            min: job.salary_min,
            max: job.salary_max,
            currency: job.salary_currency
          }
        : null,
      acceptsDirectApplications: job.accepts_direct_applications,
      externalApplicationUrl: job.external_application_url,
      company: {
        id: job.company?.id,
        name: job.company?.company_name || 'Unknown Company',
        logo: job.company?.company_logo_url,
        industry: job.company?.industry,
        verified: job.company?.is_verified || false
      },
      postedAt: job.created_at
    }));

    // Calculate pagination metadata
    const totalJobs = count || 0;
    const totalPages = Math.ceil(totalJobs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        total: totalJobs,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error in GET public jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
