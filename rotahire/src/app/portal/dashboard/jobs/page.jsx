'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAtom } from 'jotai';
import { portalUserAtom } from '@/app/state/store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CheckCircle,
  Eye,
  Search,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Building,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Play,
  Pause,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCompanyJobs, updateJobStatus, deleteJob } from '@/services/jobs/jobService';

// Premium company jobs dashboard with modern design and smooth animations
export default function CompanyJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portalUser] = useAtom(portalUserAtom);

  // State management
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Tab states - Company specific statuses
  const [activeTab, setActiveTab] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Refs for animations
  const pageRef = useRef(null);
  const jobsRef = useRef([]);
  const headerRef = useRef(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/portal/login');
    else {
      // Session is loaded, set loading to false
      setLoading(false);
    }
  }, [session, status, router]);

  // Initialize GSAP
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Load jobs when tab changes
  useEffect(() => {
    if (!loading) { // Only load if not during initial loading
      loadJobs();
    }
  }, [activeTab]);

  // Initial load when loading state changes to false
  useEffect(() => {
    if (!loading && jobs.length === 0) {
      loadJobs();
    }
  }, [loading]);

  // Filter and sort jobs
  useEffect(() => {
    let filtered = [...jobs];

    // Status filter based on active tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(job => job.status === 'pending_approval');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(job => job.status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(job => job.status === 'rejected');
    } else if (activeTab === 'approved-live') {
      filtered = filtered.filter(job => job.display_status === 'approved-live');
    } else if (activeTab === 'approved-closed') {
      filtered = filtered.filter(job => job.display_status === 'approved-closed');
    }
    // 'all' tab shows all jobs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [jobs, searchTerm, sortBy, activeTab]);

  // Tab change handler with smooth transition
  const handleTabChange = (tab) => {
    if (tab === activeTab) return; // Don't do anything if same tab

    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm(''); // Clear search when switching tabs
    setJobsLoading(true); // Show loading for job cards only

    // Loading will be triggered by the useEffect that depends on activeTab
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Page entrance animation - only on initial load
  useEffect(() => {
    if (!loading && filteredJobs.length > 0 && !hasInitialLoad) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Header animation - only on first load
        if (headerRef.current) {
          gsap.fromTo(headerRef.current,
            { y: -30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
          );
        }

        // Jobs stagger animation
        const jobCards = document.querySelectorAll('[data-job-card]');
        if (jobCards.length > 0) {
          gsap.fromTo(jobCards,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
          );
        }

        setHasInitialLoad(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [loading, filteredJobs, hasInitialLoad]);

  // Tab change animation - smoother transitions
  useEffect(() => {
    if (hasInitialLoad && !loading && filteredJobs.length > 0) {
      // Small delay for tab changes
      const timer = setTimeout(() => {
        const jobCards = document.querySelectorAll('[data-job-card]');
        if (jobCards.length > 0) {
          gsap.fromTo(jobCards,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
          );
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeTab, filteredJobs, hasInitialLoad, loading]);

  // Fetches jobs based on current filter
  const loadJobs = async () => {
    try {
      setJobsLoading(true);
      if (!portalUser?.id) {
        throw new Error('User not authenticated');
      }
      const data = await getCompanyJobs(portalUser.id);
      setJobs(data);
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error('Error loading jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  // Handles viewing job details
  const handleViewDetails = (job) => {
    // Navigate to job details page
    router.push(`/portal/dashboard/jobs/${job.id}`);
  };

  // Handles deleting a job
  const handleDeleteJob = async (job) => {
    if (!confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      if (!portalUser?.id) {
        throw new Error('User not authenticated');
      }
      await deleteJob(portalUser.id, job.id);
      toast.success('Job deleted successfully');
      // Reload jobs to reflect the change
      loadJobs();
    } catch (error) {
      toast.error('Failed to delete job');
      console.error('Error deleting job:', error);
    }
  };

  // Handles toggling job active status
  const handleToggleActive = async (job) => {
    try {
      if (!portalUser?.id) {
        throw new Error('User not authenticated');
      }
      await updateJobStatus(portalUser.id, job.id, !job.is_active);
      toast.success(`Job ${!job.is_active ? 'activated' : 'deactivated'} successfully`);
      // Reload jobs to reflect the change
      loadJobs();
    } catch (error) {
      toast.error('Failed to update job status');
      console.error('Error updating job status:', error);
    }
  };

  // Handles editing a job
  const handleEditJob = (job) => {
    // Navigate to job edit page or open edit modal
    router.push(`/portal/dashboard/post-job?edit=${job.id}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D81B5D]"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-['Poppins']">
            My Jobs
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Manage your job postings and track their performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#D81B5D]/8 to-pink-50/30 text-[#D81B5D] px-4 py-2 rounded-xl text-sm font-semibold border border-[#D81B5D]/15">
            {filteredJobs.length} {activeTab === 'all' ? 'Total' : activeTab === 'pending' ? 'Pending' : activeTab === 'approved' ? 'Approved' : activeTab === 'rejected' ? 'Rejected' : activeTab === 'approved-live' ? 'Live' : 'Closed'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-6">
        <div className="flex p-1">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#D81B5D] text-white shadow-lg transform scale-[0.98]'
                : 'text-gray-600 hover:text-[#D81B5D] hover:bg-[#D81B5D]/5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building className="w-4 h-4" />
              <span>All Jobs</span>
              {activeTab === 'all' && filteredJobs.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {filteredJobs.length}
                </span>
              )}
            </div>
            {activeTab === 'all' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('pending')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#D81B5D] text-white shadow-lg transform scale-[0.98]'
                : 'text-gray-600 hover:text-[#D81B5D] hover:bg-[#D81B5D]/5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Pending</span>
              {activeTab === 'pending' && filteredJobs.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {filteredJobs.length}
                </span>
              )}
            </div>
            {activeTab === 'pending' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('approved')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-[#D81B5D] text-white shadow-lg transform scale-[0.98]'
                : 'text-gray-600 hover:text-[#D81B5D] hover:bg-[#D81B5D]/5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Approved</span>
              {activeTab === 'approved' && filteredJobs.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {filteredJobs.length}
                </span>
              )}
            </div>
            {activeTab === 'approved' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('approved-live')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden cursor-pointer ${
              activeTab === 'approved-live'
                ? 'bg-[#D81B5D] text-white shadow-lg transform scale-[0.98]'
                : 'text-gray-600 hover:text-[#D81B5D] hover:bg-[#D81B5D]/5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              <span>Live</span>
              {activeTab === 'approved-live' && filteredJobs.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {filteredJobs.length}
                </span>
              )}
            </div>
            {activeTab === 'approved-live' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('approved-closed')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden cursor-pointer ${
              activeTab === 'approved-closed'
                ? 'bg-[#D81B5D] text-white shadow-lg transform scale-[0.98]'
                : 'text-gray-600 hover:text-[#D81B5D] hover:bg-[#D81B5D]/5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Pause className="w-4 h-4" />
              <span>Closed</span>
              {activeTab === 'approved-closed' && filteredJobs.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {filteredJobs.length}
                </span>
              )}
            </div>
            {activeTab === 'approved-closed' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('rejected')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-[#D81B5D] text-white shadow-lg transform scale-[0.98]'
                : 'text-gray-600 hover:text-[#D81B5D] hover:bg-[#D81B5D]/5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              <span>Rejected</span>
              {activeTab === 'rejected' && filteredJobs.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {filteredJobs.length}
                </span>
              )}
            </div>
            {activeTab === 'rejected' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#D81B5D] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:border-[#D81B5D] transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 h-10 cursor-pointer rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="cursor-pointer">Newest First</SelectItem>
                <SelectItem value="oldest" className="cursor-pointer">Oldest First</SelectItem>
                <SelectItem value="title" className="cursor-pointer">Job Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4 transition-opacity duration-200" style={{ opacity: jobsLoading ? 0.7 : 1 }}>
        {jobsLoading ? (
          // Loading skeleton for job cards
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Logo skeleton */}
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse flex-shrink-0"></div>

                    {/* Content skeleton */}
                    <div className="flex-1 space-y-4">
                      {/* Title skeleton */}
                      <div className="space-y-2">
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/2"></div>
                      </div>

                      {/* Meta info skeleton */}
                      <div className="flex gap-6">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-20"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-16"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-24"></div>
                      </div>

                      {/* Skills skeleton */}
                      <div className="flex gap-2">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-16"></div>
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-20"></div>
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-14"></div>
                      </div>

                      {/* Description skeleton */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>

                    {/* Button skeleton */}
                    <div className="w-24 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse flex-shrink-0"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentJobs.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D81B5D]/10 to-pink-100/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D81B5D]/15">
                <CheckCircle className="w-8 h-8 text-[#D81B5D]/60" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'all' ? 'No jobs posted yet' :
                 activeTab === 'pending' ? 'No pending jobs' :
                 activeTab === 'approved' ? 'No approved jobs yet' :
                 activeTab === 'rejected' ? 'No rejected jobs' :
                 activeTab === 'approved-live' ? 'No live jobs' :
                 'No closed jobs'}
              </h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                {activeTab === 'all' ? 'Start by posting your first job!' :
                 activeTab === 'pending' ? 'Jobs awaiting approval will appear here.' :
                 activeTab === 'approved' ? 'Approved jobs will appear here.' :
                 activeTab === 'rejected' ? 'Rejected jobs will appear here.' :
                 activeTab === 'approved-live' ? 'Active approved jobs will appear here.' :
                 'Inactive approved jobs will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          currentJobs.map((job, index) => (
            <div
              key={job.id}
              data-job-card
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-2xl hover:shadow-[#D81B5D]/5 hover:border-[#D81B5D]/20 transition-all duration-500 cursor-pointer overflow-hidden"
              onClick={() => handleViewDetails(job)}
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D81B5D]/0 via-transparent to-pink-50/0 group-hover:from-[#D81B5D]/[0.02] group-hover:to-pink-50/30 transition-all duration-500 pointer-events-none" />

              <div className="relative p-6">
                <div className="flex items-start gap-6">
                  {/* Enhanced Company Logo */}
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-50 via-white to-[#D81B5D]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200/50 group-hover:border-[#D81B5D]/20 group-hover:shadow-lg group-hover:shadow-[#D81B5D]/10 transition-all duration-500">
                    {job.company_logo ? (
                      <img
                        src={job.company_logo}
                        alt={job.company_name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Building className="w-7 h-7 text-gray-400 group-hover:text-[#D81B5D]/70 transition-colors duration-300" />
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Enhanced Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 font-['Poppins'] truncate group-hover:text-[#D81B5D] transition-colors duration-300">
                            {job.title}
                          </h3>
                          {/* Compact Status Badge */}
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm transition-all duration-300 ${
                            job.status === 'approved' && job.is_active
                              ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60'
                              : job.status === 'approved' && !job.is_active
                              ? 'bg-blue-50/80 text-blue-700 border-blue-200/60'
                              : job.status === 'pending_approval'
                              ? 'bg-amber-50/80 text-amber-700 border-amber-200/60'
                              : job.status === 'rejected'
                              ? 'bg-red-50/80 text-red-700 border-red-200/60'
                              : 'bg-gray-50/80 text-gray-700 border-gray-200/60'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {job.status === 'approved' && job.is_active ? (
                                <Play className="w-3 h-3" />
                              ) : job.status === 'approved' && !job.is_active ? (
                                <Pause className="w-3 h-3" />
                              ) : job.status === 'pending_approval' ? (
                                <Eye className="w-3 h-3" />
                              ) : job.status === 'rejected' ? (
                                <X className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>
                                {job.status === 'approved' && job.is_active ? 'Live' :
                                 job.status === 'approved' && !job.is_active ? 'Closed' :
                                 job.status === 'pending_approval' ? 'Pending' :
                                 job.status === 'rejected' ? 'Rejected' : 'Draft'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium truncate group-hover:text-gray-700 transition-colors duration-300">
                          {job.company_name}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Key Info Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5 group/info hover:text-[#D81B5D] transition-colors duration-200">
                        <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center group-hover/info:bg-[#D81B5D]/10 transition-colors duration-200">
                          <MapPin className="w-3 h-3 text-gray-500 group-hover/info:text-[#D81B5D] transition-colors duration-200" />
                        </div>
                        <span className="font-medium">{job.location || job.city || 'Remote'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 group/info hover:text-[#D81B5D] transition-colors duration-200">
                        <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center group-hover/info:bg-[#D81B5D]/10 transition-colors duration-200">
                          <Users className="w-3 h-3 text-gray-500 group-hover/info:text-[#D81B5D] transition-colors duration-200" />
                        </div>
                        <span className="font-medium capitalize">{job.experience_level}</span>
                      </div>
                      <div className="flex items-center gap-1.5 group/info hover:text-gray-700 transition-colors duration-200">
                        <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center group-hover/info:bg-gray-200 transition-colors duration-200">
                          <Calendar className="w-3 h-3 text-gray-500 group-hover/info:text-gray-600 transition-colors duration-200" />
                        </div>
                        <span className="font-medium">
                          {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 group/info hover:text-green-700 transition-colors duration-200">
                        <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center group-hover/info:bg-green-200 transition-colors duration-200">
                          <DollarSign className="w-3 h-3 text-green-600 group-hover/info:text-green-700 transition-colors duration-200" />
                        </div>
                        <span className="font-medium text-green-700">{job.salary_min ? `$${(job.salary_min).toLocaleString()}` : 'Not specified'}</span>
                      </div>
                    </div>

                    {/* Enhanced Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.slice(0, 4).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-3 py-1.5 bg-gradient-to-r from-[#D81B5D]/5 to-pink-50/30 border border-[#D81B5D]/15 rounded-lg text-xs font-semibold text-[#D81B5D] hover:from-[#D81B5D]/10 hover:to-pink-50/50 hover:shadow-sm hover:shadow-[#D81B5D]/10 transition-all duration-300 cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors duration-200 cursor-default">
                            +{job.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Enhanced Description Preview */}
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                      {job.description?.substring(0, 120)}...
                    </p>
                  </div>

                  {/* Compact Action Buttons */}
                  <div className="flex-shrink-0 flex flex-col gap-2 ml-4 items-center">
                    {/* Primary Action Button */}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(job);
                      }}
                      className="h-8 w-8 p-0 bg-gradient-to-r from-[#D81B5D] to-pink-600 hover:from-[#D81B5D]/90 hover:to-pink-600/90 text-white transition-all duration-300 rounded-md cursor-pointer group/btn flex items-center justify-center"
                      title="View Job Details"
                    >
                      <Eye className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-all duration-300" />
                    </Button>

                    {/* Secondary Actions - All stacked vertically */}
                    {job.status === 'approved' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(job);
                        }}
                        className="h-8 w-8 p-0 border border-gray-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white text-gray-600 bg-white transition-all duration-300 rounded-md cursor-pointer group/btn flex items-center justify-center"
                        title={job.is_active ? 'Pause Job' : 'Resume Job'}
                      >
                        {job.is_active ? (
                          <Pause className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform duration-200" />
                        ) : (
                          <Play className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-all duration-200" />
                        )}
                      </button>
                    )}
                    {job.status === 'draft' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJob(job);
                          }}
                          className="h-8 w-8 p-0 border border-gray-200 hover:border-blue-500 hover:bg-blue-500 hover:text-white text-gray-600 bg-white transition-all duration-300 rounded-md cursor-pointer group/btn flex items-center justify-center"
                          title="Edit Job"
                        >
                          <Edit className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-all duration-200" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job);
                          }}
                          className="h-8 w-8 p-0 border border-gray-200 hover:border-red-500 hover:bg-red-500 hover:text-white text-gray-600 bg-white transition-all duration-300 rounded-md cursor-pointer group/btn flex items-center justify-center"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-all duration-200" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Subtle bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D81B5D]/20 via-pink-500/20 to-[#D81B5D]/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/60 p-4">
          <div className="text-sm text-gray-600 font-medium">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="h-9 px-3 border-gray-300 hover:border-[#D81B5D] hover:text-[#D81B5D] disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className={`h-9 w-9 p-0 ${
                      currentPage === pageNum
                        ? 'bg-[#D81B5D] hover:bg-[#D81B5D]/90 text-white'
                        : 'border-gray-300 hover:border-[#D81B5D] hover:text-[#D81B5D]'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="h-9 px-3 border-gray-300 hover:border-[#D81B5D] hover:text-[#D81B5D] disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}