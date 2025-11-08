'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAtom } from 'jotai';
import { adminUserAtom } from '@/app/state/store';
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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllJobs } from '@/services/admin/adminJobService';

// Premium admin job approvals dashboard with modern design and smooth animations
export default function JobApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [adminUser] = useAtom(adminUserAtom);

  // State management
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Tab states
  const [activeTab, setActiveTab] = useState('pending');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Refs for animations
  const pageRef = useRef(null);
  const jobsRef = useRef([]);
  const headerRef = useRef(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/admin/login');
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
      filtered = filtered.filter(job => !job.status || job.status === 'pending_approval');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(job => job.status === 'approved');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(job => job.status === 'rejected');
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        case 'company':
          return a.company_name.localeCompare(b.company_name);
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
      let statusParam = null;
      if (activeTab === 'approved') statusParam = 'approved';
      if (activeTab === 'rejected') statusParam = 'rejected';
      if (activeTab === 'pending') statusParam = 'pending_approval';

      const data = await getAllJobs(statusParam);
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
    router.push(`/admin/dashboard/job-approvals/${job.id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50/30 via-white to-pink-50/20">
      <div ref={pageRef} className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="space-y-0.5">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-['Poppins']">
            Job Approvals
          </h1>
          <p className="text-gray-600 text-sm">
            {activeTab === 'pending' ? 'Review and approve job postings from companies' :
             activeTab === 'approved' ? 'View all approved job postings' :
             'View all rejected job postings'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-[#D81B5D]/8 to-pink-50/30 text-[#D81B5D] px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#D81B5D]/15">
            {filteredJobs.length} {activeTab === 'pending' ? 'Pending' : activeTab === 'approved' ? 'Approved' : 'Rejected'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-6">
        <div className="flex p-1">
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
              <span>Pending Review</span>
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
                  placeholder="Search jobs, companies..."
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
                <SelectItem value="company" className="cursor-pointer">Company Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3 transition-opacity duration-200" style={{ opacity: jobsLoading ? 0.7 : 1 }}>
        {jobsLoading ? (
          // Loading skeleton for job cards
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Logo skeleton */}
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse flex-shrink-0"></div>

                    {/* Content skeleton */}
                    <div className="flex-1 space-y-3">
                      {/* Title skeleton */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/2"></div>
                      </div>

                      {/* Meta info skeleton */}
                      <div className="flex gap-4">
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-20"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-16"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-24"></div>
                      </div>

                      {/* Skills skeleton */}
                      <div className="flex gap-2">
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-16"></div>
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-20"></div>
                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-14"></div>
                      </div>

                      {/* Description skeleton */}
                      <div className="space-y-1">
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>

                    {/* Button skeleton */}
                    {activeTab === 'pending' && (
                      <div className="w-20 h-9 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentJobs.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="p-10 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D81B5D]/10 to-pink-100/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#D81B5D]/15">
                <CheckCircle className="w-7 h-7 text-[#D81B5D]/60" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {activeTab === 'pending' ? 'All caught up!' :
                 activeTab === 'approved' ? 'No approved jobs yet' :
                 'No rejected jobs yet'}
              </h3>
              <p className="text-gray-600 text-xs">
                {activeTab === 'pending' ? 'No jobs pending approval at the moment.' :
                 activeTab === 'approved' ? 'Approved jobs will appear here.' :
                 'Rejected jobs will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          currentJobs.map((job, index) => (
            <div
              key={job.id}
              data-job-card
              className="group bg-white rounded-xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:border-[#D81B5D]/20 transition-all duration-200 cursor-pointer"
              onClick={() => handleViewDetails(job)}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-[#D81B5D]/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200/50">
                    {job.company_logo ? (
                      <img
                        src={job.company_logo}
                        alt={job.company_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-[#D81B5D]/60" />
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 font-['Poppins'] truncate group-hover:text-[#D81B5D] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium truncate">{job.company_name}</p>
                      </div>
                      {/* Status Badge */}
                      {activeTab !== 'pending' && (
                        <div className={`flex-shrink-0 ml-2 px-2 py-1 rounded-md text-xs font-medium ${
                          activeTab === 'approved'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          <div className="flex items-center gap-1">
                            {activeTab === 'approved' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            {activeTab === 'approved' ? 'Approved' : 'Rejected'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Key Info Row */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#D81B5D]" />
                        <span className="font-medium">{job.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#D81B5D]" />
                        <span className="font-medium capitalize">{job.experience_level}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#D81B5D]/70" />
                        <span className="font-medium">
                          {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-[#D81B5D]/70" />
                        <span className="font-medium">{job.salary_min ? `$${(job.salary_min).toLocaleString()}` : 'Not specified'}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills.slice(0, 4).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-0.5 bg-[#D81B5D]/5 border border-[#D81B5D]/15 rounded-md text-xs font-medium text-[#D81B5D]"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-500">
                            +{job.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description Preview */}
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {job.description?.substring(0, 120)}...
                    </p>
                  </div>

                  {/* Action Button - Only for pending jobs */}
                  {activeTab === 'pending' && (
                    <div className="flex-shrink-0 ml-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(job);
                        }}
                        className="h-9 px-4 bg-[#D81B5D] hover:bg-[#D81B5D]/90 text-white font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </div>
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
    </div>
  );
}