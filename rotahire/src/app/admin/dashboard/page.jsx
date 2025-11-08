'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Main admin dashboard page with overview and quick actions
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/admin/login');
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D81B5D]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userPermissionLevel = session.user?.permission_level;
  const userRoleId = session.user?.role_id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-['Poppins']">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          userPermissionLevel === 'super_admin'
            ? 'bg-red-100 text-red-800'
            : userPermissionLevel === 'admin'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {userPermissionLevel === 'super_admin' ? 'Super Admin' :
           userPermissionLevel === 'admin' ? 'Admin' : 'Basic Admin'}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports Generated</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">⚙️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">Good</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admin/dashboard/members')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <p className="font-medium text-gray-900">Manage Members</p>
                <p className="text-sm text-gray-600">Add, edit, or remove members</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/dashboard/events')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">📅</span>
              <div>
                <p className="font-medium text-gray-900">Manage Events</p>
                <p className="text-sm text-gray-600">Create and organize events</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/dashboard/reports')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-600">Generate and view analytics</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">System initialized</p>
              <p className="text-xs text-gray-600">Just now</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          More activity data will be displayed here as the system is used.
        </p>
      </div>
    </div>
  );
}