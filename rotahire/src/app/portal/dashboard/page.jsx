'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { useRouter, useSearchParams } from 'next/navigation';
import { portalUserAtom } from '@/app/state/store';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Users,
  Briefcase,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Calendar
} from 'lucide-react';

export default function DashboardPage() {
  console.log('🔵 DashboardPage RENDERING');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [portalUser] = useAtom(portalUserAtom);
  const [companyData, setCompanyData] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedCompany, setHasCheckedCompany] = useState(false);
  
  // Check if coming from onboarding completion
  const justCompletedOnboarding = searchParams.get('onboarding') === 'completed';

  // Fetch dashboard data on mount using Supabase session directly
  useEffect(() => {
    console.log('🟢 useEffect TRIGGERED');
    const fetchDashboardData = async () => {
      try {
        console.log('Dashboard: Fetching user session...');
        
        // Get session - this is synchronous from browser cache
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user?.id) {
          console.log('Dashboard: No valid session, redirecting to login');
          router.push('/portal/login');
          return;
        }

        const userId = session.user.id;
        console.log('Dashboard: Got userId from session:', userId);
        
        // Fetch company data
        console.log('Dashboard: Fetching company data for user:', userId);
        
        const { data: memberData, error: memberError } = await supabase
          .from('company_members')
          .select(`
            id,
            role,
            companies (
              id,
              company_name,
              status,
              is_verified
            )
          `)
          .eq('user_id', userId)
          .maybeSingle();

        if (memberError && memberError.code !== 'PGRST116') {
          console.error('Dashboard: Error fetching company:', memberError);
        }

        if (memberData && memberData.companies) {
          setCompanyData(memberData.companies);
          console.log('Dashboard: Company found:', memberData.companies.company_name);
        } else {
          console.log('Dashboard: No company found for user');
          setCompanyData(null);
        }

        setStats({
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          newApplications: 0
        });
        setRecentJobs([]);

      } catch (error) {
        console.error('Dashboard: Error:', error);
        setCompanyData(null);
      } finally {
        console.log('Dashboard: Company check complete');
        setIsLoading(false);
        setHasCheckedCompany(true);
      }
    };

    // Fetch data immediately on mount
    fetchDashboardData();
  }, []); // Empty dependency array - run only on mount

  // Redirect to onboarding if no company data and not loading
  useEffect(() => {
    if (hasCheckedCompany && !isLoading && !companyData) {
      console.log('No company data found, redirecting to onboarding...');
      router.push('/portal/dashboard/onboarding');
    }
  }, [hasCheckedCompany, isLoading, companyData, router]);

  // Show loading screen while fetching
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D81B5D] mx-auto mb-4"></div>
          <p className="text-gray-600 font-['Inter']">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#D81B5D] to-[#FF0057] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-['Poppins'] mb-2">
              Welcome back, {portalUser?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-pink-100 font-['Inter']">
              {companyData ? `Managing ${companyData.company_name}` : 'Ready to start hiring?'}
            </p>
          </div>
          <div className="hidden md:block">
            <Building className="w-16 h-16 text-pink-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-['Poppins']">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#D81B5D]">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground font-['Inter']">
              All time job postings
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-['Poppins']">Active Jobs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground font-['Inter']">
              Currently live
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-['Poppins']">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground font-['Inter']">
              Total received
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-['Poppins']">New Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.newApplications}</div>
            <p className="text-xs text-muted-foreground font-['Inter']">
              New applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-['Poppins']">Quick Actions</CardTitle>
          <CardDescription className="font-['Inter']">
            Get started with your hiring process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => router.push('/portal/dashboard/post-job')}
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-[#D81B5D] to-[#FF0057] hover:from-[#FF0057] hover:to-[#D81B5D]"
            >
              <Plus className="w-6 h-6" />
              <span className="font-['Poppins'] font-medium">Post New Job</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border-[#D81B5D] text-[#D81B5D] hover:bg-[#D81B5D] hover:text-white">
              <Eye className="w-6 h-6" />
              <span className="font-['Poppins'] font-medium">View Applications</span>
            </Button>

            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2 border-[#D81B5D] text-[#D81B5D] hover:bg-[#D81B5D] hover:text-white">
              <Edit className="w-6 h-6" />
              <span className="font-['Poppins'] font-medium">Edit Company Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Info & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins']">Company Information</CardTitle>
            <CardDescription className="font-['Inter']">
              Your company profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyData ? (
              <>
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-[#D81B5D]" />
                  <div>
                    <p className="font-medium font-['Poppins']">{companyData.company_name}</p>
                    <p className="text-sm text-gray-500 font-['Inter']">{companyData.industry}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-['Inter']">Company Size:</span>
                  <Badge variant="secondary">{companyData.company_size} employees</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-['Inter']">Member Since:</span>
                  <span className="text-sm font-medium font-['Inter']">
                    {new Date(companyData.created_at).toLocaleDateString()}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500 font-['Inter']">Loading company information...</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Job Postings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Poppins']">Recent Job Postings</CardTitle>
            <CardDescription className="font-['Inter']">
              Your latest job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium font-['Poppins']">{job.title}</p>
                      <p className="text-sm text-gray-500 font-['Inter']">{job.location}</p>
                    </div>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-['Inter'] mb-4">No job postings yet</p>
                <Button 
                  onClick={() => router.push('/portal/dashboard/post-job')}
                  className="bg-gradient-to-r from-[#D81B5D] to-[#FF0057] hover:from-[#FF0057] hover:to-[#D81B5D]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}