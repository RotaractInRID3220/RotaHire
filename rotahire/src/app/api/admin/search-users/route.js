import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  // Validates minimum 3 characters
  if (!name || name.length < 3) {
    return NextResponse.json({ error: "Name must be at least 3 characters" }, { status: 400 });
  }

  try {
    // Queries DBMID API for users with admin roles (1-4)
    const sql = 'SELECT membership_id as RMIS_ID, card_name, role_id FROM club_membership_data WHERE role_id IN (1,2,3,4) AND card_name LIKE ?';

    const res = await fetch('https://info.rotaract3220.org/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_DBMID_API_KEY,
      },
      body: JSON.stringify({
        sql,
        params: [`%${name}%`],  // Wildcard search
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from DBMID API');
    }

    const data = await res.json();
    const users = data.results || [];

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}