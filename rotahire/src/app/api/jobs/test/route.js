// src/app/api/jobs/test/route.js
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get table info
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Jobs table exists'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}