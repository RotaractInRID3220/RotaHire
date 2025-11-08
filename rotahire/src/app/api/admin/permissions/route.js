import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET: Fetch all admin permissions
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select(`
        rmis_id,
        permission_level,
        additional_permissions,
        is_active,
        assigned_at,
        assignment_reason,
        admin_users!permissions_rmis_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching permissions:', error);
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
    }

    // Construct card_name from first_name and last_name
    const permissionsWithCardName = data.map(permission => ({
      ...permission,
      card_name: permission.admin_users
        ? `${permission.admin_users.first_name} ${permission.admin_users.last_name}`
        : 'Unknown User'
    }));

    return NextResponse.json({ permissions: permissionsWithCardName }, { status: 200 });
  } catch (error) {
    console.error('Error in GET permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update admin permission
export async function POST(request) {
  try {
    const { RMIS_ID, rmis_id, permission_level, assignment_reason, assigned_by, card_name } = await request.json();
    const userRmisId = RMIS_ID || rmis_id;

    // Validation
    if (!userRmisId || !permission_level) {
      return NextResponse.json(
        { error: "rmis_id and permission_level are required" },
        { status: 400 }
      );
    }

    if (!['super_admin', 'admin', 'basic'].includes(permission_level)) {
      return NextResponse.json(
        { error: "Invalid permission_level. Must be 'basic', 'admin', or 'super_admin'" },
        { status: 400 }
      );
    }

    // If card_name is provided, ensure admin user exists with the name
    if (card_name) {
      // Split card_name into first_name and last_name (assuming format "First Last")
      const nameParts = card_name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Upsert admin user
      const { error: upsertError } = await supabase
        .from('admin_users')
        .upsert({
          rmis_id: userRmisId,
          first_name: firstName,
          last_name: lastName,
          email: `${userRmisId}@rotaract3220.org`, // Default email
          role: permission_level === 'super_admin' ? 'super_admin' : 'moderator',
          is_active: true
        });

      if (upsertError) {
        console.error('Error upserting admin user:', upsertError);
        return NextResponse.json({ error: 'Failed to create/update admin user' }, { status: 500 });
      }
    }

    // First check if admin user exists in admin_users table
    const { data: adminUser, error: checkError } = await supabase
      .from('admin_users')
      .select('rmis_id')
      .eq('rmis_id', userRmisId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking admin user:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user with this RMIS_ID does not exist" },
        { status: 404 }
      );
    }

    // Upsert permission (insert or update if exists)
    const { data, error } = await supabase
      .from('permissions')
      .upsert({
        rmis_id: userRmisId,
        permission_level,
        assignment_reason: assignment_reason || null,
        assigned_by: assigned_by || null,
        assigned_at: new Date().toISOString(),
        is_active: true
      })
      .select();

    if (error) {
      console.error('Error adding permission:', error);
      return NextResponse.json({ error: 'Failed to add permission' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        permission: data?.[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update admin permission
export async function PATCH(request) {
  try {
    const { rmis_id, permission_level, assignment_reason } = await request.json();

    if (!rmis_id || !permission_level) {
      return NextResponse.json(
        { error: "rmis_id and permission_level are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('permissions')
      .update({
        permission_level,
        assignment_reason: assignment_reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('rmis_id', rmis_id)
      .select();

    if (error) {
      console.error('Error updating permission:', error);
      return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 });
    }

    return NextResponse.json({ success: true, permission: data?.[0] }, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove admin permission
export async function DELETE(request) {
  try {
    const { rmis_id } = await request.json();

    if (!rmis_id) {
      return NextResponse.json(
        { error: "rmis_id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('rmis_id', rmis_id);

    if (error) {
      console.error('Error removing permission:', error);
      return NextResponse.json({ error: 'Failed to remove permission' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}