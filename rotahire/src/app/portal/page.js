'use client';

import { useAtom } from 'jotai';
import { portalUserAtom } from '@/app/state/store';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Portal home page - protected route
export default function PortalPage() {
  const [portalUser] = useAtom(portalUserAtom);
  const router = useRouter();

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/portal/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="font-['Poppins'] text-2xl font-bold text-[#D81B5D]">Rota</span>
              <span className="font-['Courgette'] text-2xl text-[#D81B5D]">Hire</span>
              <span className="ml-4 text-gray-500 font-['Inter'] text-sm">Company Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-['Inter'] text-sm">
                Welcome, {portalUser?.email?.split('@')[0] || 'Company'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-[#D81B5D] hover:bg-[#FF0057] text-white font-['Poppins'] text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">
              Welcome to RotaHire Portal
            </h1>
            <p className="text-gray-600 font-['Inter'] text-lg">
              Manage your company's profile and connect with talented Rotaractors
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-[#D81B5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 font-['Poppins']">Company Profile</h3>
                    <p className="text-sm text-gray-500 font-['Inter']">Update your company information</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-[#D81B5D] hover:bg-[#FF0057] text-white font-['Poppins'] text-sm px-4 py-2 rounded-lg transition-colors">
                    Manage Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-[#D81B5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 font-['Poppins']">Job Postings</h3>
                    <p className="text-sm text-gray-500 font-['Inter']">Create and manage job opportunities</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-[#D81B5D] hover:bg-[#FF0057] text-white font-['Poppins'] text-sm px-4 py-2 rounded-lg transition-colors">
                    View Jobs
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-[#D81B5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 font-['Poppins']">Analytics</h3>
                    <p className="text-sm text-gray-500 font-['Inter']">View application statistics</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-[#D81B5D] hover:bg-[#FF0057] text-white font-['Poppins'] text-sm px-4 py-2 rounded-lg transition-colors">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 font-['Poppins'] mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Poppins']">Email</label>
                <p className="mt-1 text-sm text-gray-900 font-['Inter']">{portalUser?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-['Poppins']">Account Created</label>
                <p className="mt-1 text-sm text-gray-900 font-['Inter']">
                  {portalUser?.created_at ? new Date(portalUser.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
