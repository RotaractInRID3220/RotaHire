import { NextResponse } from 'next/server';

const DBMID_API_URL = 'https://info.rotaract3220.org/api/query';
const DBMID_API_KEY = process.env.NEXT_PUBLIC_DBMID_API_KEY;

/**
 * API endpoint for member lookup in DBMID
 * Searches by RMIS_ID (membership_id) or NIC (nic_pp)
 * 
 * GET /api/member-lookup?rmisId=xxx&nic=xxx
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rmisId = searchParams.get('rmisId');
    const nic = searchParams.get('nic');

    // At least one search parameter required
    if (!rmisId && !nic) {
      return NextResponse.json(
        { success: false, error: 'Please provide RMIS ID or NIC' },
        { status: 400 }
      );
    }

    // Build SQL query based on provided parameters
    let sql = 'SELECT * FROM club_membership_data WHERE ';
    const params = [];
    const conditions = [];

    if (rmisId) {
      conditions.push('membership_id = ?');
      params.push(rmisId);
    }

    if (nic) {
      conditions.push('nic_pp = ?');
      params.push(nic);
    }

    sql += conditions.join(' OR ') + ' LIMIT 10'; // Limit to 10 results

    // Query DBMID API
    const response = await fetch(DBMID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DBMID_API_KEY
      },
      body: JSON.stringify({
        sql,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`DBMID API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({
        success: true,
        members: [],
        message: 'No members found with the provided information'
      });
    }

    // Return sanitized member data
    const members = data.results.map(member => ({
      membershipId: member.membership_id,
      fullName: member.full_name,
      nic: member.nic_pp,
      clubId: member.club_id,
      clubName: member.club_name,
      email: member.email,
      mobile: member.mobile
    }));

    return NextResponse.json({
      success: true,
      members
    });

  } catch (error) {
    console.error('[Member Lookup] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to lookup member information' },
      { status: 500 }
    );
  }
}
