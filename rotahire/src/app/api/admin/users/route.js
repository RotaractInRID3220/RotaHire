import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET: Fetch all admin users
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
    }

    return NextResponse.json({ admin_users: data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET admin_users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new admin user
export async function POST(request) {
  try {
    const {
      rmis_id,
      first_name,
      last_name,
      email,
      mobile,
      role,
      assigned_by
    } = await request.json();

    // Validation
    if (!rmis_id || !first_name || !last_name || !email || !role) {
      return NextResponse.json(
        { error: 'rmis_id, first_name, last_name, email, and role are required' },
        { status: 400 }
      );
    }

    if (!['super_admin', 'district_admin', 'moderator'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'super_admin', 'district_admin', or 'moderator'" },
        { status: 400 }
      );
    }

    // Validate RMIS_ID format (numeric only)
    if (!/^\d+$/.test(rmis_id)) {
      return NextResponse.json(
        { error: 'RMIS_ID must contain only numbers' },
        { status: 400 }
      );
    }

    // Insert new admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        rmis_id,
        first_name,
        last_name,
        email,
        mobile: mobile || null,
        role,
        assigned_by: assigned_by || null,
        assigned_at: new Date().toISOString(),
        is_active: true
      })
      .select();

    if (error) {
      console.error('Error creating admin user:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Admin user with this RMIS_ID or email already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, admin_user: data?.[0] }, { status: 201 });
  } catch (error) {
    console.error('Error in POST admin_users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update admin user
export async function PATCH(request) {
  try {
    const {
      rmis_id,
      first_name,
      last_name,
      email,
      mobile,
      role,
      is_active
    } = await request.json();

    if (!rmis_id) {
      return NextResponse.json(
        { error: 'rmis_id is required' },
        { status: 400 }
      );
    }

    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('rmis_id', rmis_id)
      .select();

    if (error) {
      console.error('Error updating admin user:', error);
      return NextResponse.json({ error: 'Failed to update admin user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, admin_user: data?.[0] }, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH admin_users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Deactivate admin user
export async function DELETE(request) {
  try {
    const { rmis_id } = await request.json();

    if (!rmis_id) {
      return NextResponse.json(
        { error: 'rmis_id is required' },
        { status: 400 }
      );
    }

    // Deactivate instead of hard delete
    const { error } = await supabase
      .from('admin_users')
      .update({ is_active: false })
      .eq('rmis_id', rmis_id);

    if (error) {
      console.error('Error deactivating admin user:', error);
      return NextResponse.json({ error: 'Failed to deactivate admin user' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE admin_users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
