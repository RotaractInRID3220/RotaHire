import { NextResponse } from 'next/server';
import { getUserByUsername, getClubMembers, verifyPassword } from '@/services/dbmidService';

/**
 * API endpoint for DBMID club membership queries
 * Handles user authentication validation and club member data fetching
 * 
 * GET /api/council?username=xxx&password=xxx - Authenticate user
 * GET /api/council?clubID=xxx - Fetch club members
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const password = searchParams.get('password');
    const clubID = searchParams.get('clubID');

    // Scenario 1: User Authentication
    if (username && password) {
      const user = await getUserByUsername(username);

      if (!user) {
        return NextResponse.json(
          { success: false, authorized: false, error: 'User not found' },
          { status: 401 }
        );
      }

      // Verify password with shared service
      if (!verifyPassword(password, user.m_password)) {
        return NextResponse.json(
          { success: false, authorized: false, error: 'Invalid password' },
          { status: 401 }
        );
      }

      // Return user without password for security
      const { m_password, ...safeUser } = user;

      return NextResponse.json({
        success: true,
        authorized: true,
        memberData: safeUser
      });
    }

    // Scenario 2: Fetch club members
    if (clubID) {
      const membersList = await getClubMembers(clubID);

      // Remove passwords from all users for security
      const safeMembersList = membersList.map(({ m_password, ...user }) => user);

      return NextResponse.json({
        success: true,
        memberData: safeMembersList,
        clubID: clubID,
        total: safeMembersList.length
      });
    }

    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Council API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
