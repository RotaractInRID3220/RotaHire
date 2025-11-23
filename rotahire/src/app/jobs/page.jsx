'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JobCard from './components/JobCard';
import { getPublicJobs } from '@/services/jobs/jobService';

// Label constants for filters
const MODE_LABELS = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site'
};

const FIELD_LABELS = {
  software_engineering: 'Software Engineering',
  data_science: 'Data Science',
  design: 'Design',
  marketing: 'Marketing',
  sales: 'Sales',
  finance: 'Finance',
  human_resources: 'HR',
  operations: 'Operations',
  consulting: 'Consulting',
  healthcare: 'Healthcare',
  education: 'Education',
  engineering: 'Engineering',
  legal: 'Legal',
  customer_support: 'Customer Support',
  content_writing: 'Content Writing',
  other: 'Other'
};

const EXPERIENCE_LABELS = {
  internship: 'Internship',
  entry_level: 'Entry Level',
  mid_level: 'Mid Level',
  senior_level: 'Senior Level',
  lead_level: 'Lead',
  executive: 'Executive'
};

export default function PublicJobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    field: null,
    mode: null,
    experience: null,
    location: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Refs for animations
  const heroRef = useRef(null);
  const searchBarRef = useRef(null);
  const jobsGridRef = useRef(null);
  const jobCardRefs = useRef([]);

  // Initialize GSAP
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Initial load and URL param handling
  useEffect(() => {
    // Get initial params from URL
    const urlSearch = searchParams.get('search') || '';
    const urlField = searchParams.get('field') || null;
    const urlMode = searchParams.get('mode') || null;
    const urlExperience = searchParams.get('experience') || null;
    const urlLocation = searchParams.get('location') || '';
    const urlPage = parseInt(searchParams.get('page')) || 1;

    setSearchQuery(urlSearch);
    setActiveFilters({
      field: urlField,
      mode: urlMode,
      experience: urlExperience,
      location: urlLocation
    });
    setCurrentPage(urlPage);

    loadJobs({
      search: urlSearch,
      field: urlField,
      mode: urlMode,
      experience: urlExperience,
      location: urlLocation,
      page: urlPage
    });
  }, []);

  // Hero entrance animation
  useEffect(() => {
    if (heroRef.current && !loading) {
      const tl = gsap.timeline();
      
      tl.from(heroRef.current.querySelector('.hero-title'), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      })
      .from(heroRef.current.querySelector('.hero-subtitle'), {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4')
      .from(searchBarRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3');
    }
  }, [loading]);

  // Job cards stagger animation
  useEffect(() => {
    if (jobCardRefs.current.length > 0 && !loading && jobCardRefs.current.every(ref => ref !== null)) {
      gsap.fromTo(jobCardRefs.current,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power2.out',
          clearProps: 'all'
        }
      );
    }
  }, [jobs, loading]);

  // Load jobs function
  const loadJobs = async (filters = {}) => {
    try {
      setSearching(true);
      
      const result = await getPublicJobs({
        search: filters.search || searchQuery,
        field: filters.field || activeFilters.field,
        mode: filters.mode || activeFilters.mode,
        experience: filters.experience || activeFilters.experience,
        location: filters.location || activeFilters.location,
        page: filters.page || currentPage,
        limit: 12
      });

      setJobs(result.data || []);
      setPagination(result.pagination || {});
      
      // Scroll to top of jobs grid smoothly
      if (jobsGridRef.current && filters.page) {
        window.scrollTo({
          top: jobsGridRef.current.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURLParams({ search: searchQuery, page: 1 });
    loadJobs({ search: searchQuery, page: 1 });
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: activeFilters[filterType] === value ? null : value
    };
    
    setActiveFilters(newFilters);
    setCurrentPage(1);
    updateURLParams({ ...newFilters, page: 1 });
    loadJobs({ ...newFilters, page: 1 });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveFilters({
      field: null,
      mode: null,
      experience: null,
      location: ''
    });
    setCurrentPage(1);
    updateURLParams({});
    loadJobs({ search: '', field: null, mode: null, experience: null, location: '', page: 1 });
  };

  // Update URL params
  const updateURLParams = (params) => {
    const newParams = new URLSearchParams();
    
    if (params.search) newParams.set('search', params.search);
    if (params.field) newParams.set('field', params.field);
    if (params.mode) newParams.set('mode', params.mode);
    if (params.experience) newParams.set('experience', params.experience);
    if (params.location) newParams.set('location', params.location);
    if (params.page && params.page > 1) newParams.set('page', params.page);
    
    router.push(`/jobs?${newParams.toString()}`, { scroll: false });
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateURLParams({ ...activeFilters, search: searchQuery, page: newPage });
    loadJobs({ page: newPage });
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || activeFilters.field || activeFilters.mode || 
                           activeFilters.experience || activeFilters.location;

  // Active filter count
  const activeFilterCount = [
    activeFilters.field,
    activeFilters.mode,
    activeFilters.experience,
    activeFilters.location
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative bg-gradient-to-br from-[#FFF8FA] via-white to-[#FFF8FA] pt-20 pb-10 px-4 md:px-8 overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D81B5D]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF0057]/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-10">
            <h1 className="hero-title text-3xl md:text-4xl lg:text-5xl font-semibold text-[#121212] font-['Poppins'] mb-3">
              Find Your Next
              <span className="text-[#D81B5D]"> Opportunity</span>
            </h1>
            {/* <p className="hero-subtitle text-base md:text-lg text-[#7D7D7D] font-['Inter'] max-w-2xl mx-auto">
              Discover amazing job opportunities posted by verified companies in the Rotaract community
            </p> */}
          </div>

          {/* Search Bar */}
          <div 
            ref={searchBarRef}
            className="max-w-4xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7D7D7D] transition-colors group-focus-within:text-[#D81B5D]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job title, company, or keyword..."
                  className="w-full h-14 pl-14 pr-32 rounded-[12px] border border-[#D9D9D9] bg-white/80 backdrop-blur-sm text-[#121212] placeholder:text-[#A1A1A1] font-['Poppins'] text-base focus:outline-none focus:ring-2 focus:ring-[#D81B5D]/20 focus:border-[#D81B5D] transition-all"
                />
                <Button
                  type="submit"
                  disabled={searching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-[#D81B5D] hover:bg-[#D81B5D]/90 text-white rounded-[12px] font-['Poppins'] text-sm transition-all"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
            </form>

            {/* Quick Filters */}
            <div className="mt-5 flex flex-wrap items-center gap-2 justify-center">
              {/* Mode Filters */}
              {Object.entries(MODE_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleFilterChange('mode', value)}
                  className={`px-4 py-2 rounded-full border font-['Poppins'] text-sm transition-all ${
                    activeFilters.mode === value
                      ? 'bg-[#D81B5D] border-[#D81B5D] text-white'
                      : 'bg-white border-[#D9D9D9] text-[#7D7D7D] hover:border-[#D81B5D] hover:text-[#D81B5D]'
                  }`}
                >
                  {label}
                </button>
              ))}

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-2 rounded-full border font-['Poppins'] text-sm transition-all flex items-center gap-2 ${
                  showAdvancedFilters || activeFilterCount > 0
                    ? 'bg-[#D81B5D]/10 border-[#D81B5D] text-[#D81B5D]'
                    : 'bg-white border-[#D9D9D9] text-[#7D7D7D] hover:border-[#D81B5D] hover:text-[#D81B5D]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                More Filters
                {activeFilterCount > 0 && (
                  <Badge className="bg-[#D81B5D] text-white text-xs px-1.5 py-0.5 min-w-[20px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-full border border-[#D9D9D9] bg-white text-[#7D7D7D] hover:text-[#D81B5D] hover:border-[#D81B5D] font-['Poppins'] text-sm transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <section
                aria-label="Advanced job filters"
                className="mt-6 rounded-[16px] border border-[#F3E4EA] bg-gradient-to-br from-[#FFF8FA] via-white to-[#FFF0F6] p-6 md:p-7 backdrop-blur-[6px]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6 mb-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[#121212] font-['Poppins']">
                      Refine your search
                    </h3>
                    <p className="text-sm text-[#6F6F6F] font-['Inter']">
                      Layer filters to tailor roles to your experience and interests.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeFilterCount > 0 ? (
                      <Badge className="h-8 rounded-full bg-[#D81B5D]/10 text-[#D81B5D] border-[#D81B5D]/30 font-['Inter'] text-sm px-3">
                        {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} active
                      </Badge>
                    ) : (
                      <span className="text-sm text-[#A1A1A1] font-['Inter']">
                        No additional filters selected
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFilters(false)}
                      className="hidden md:inline-flex items-center gap-1.5 text-sm font-['Inter'] text-[#7D7D7D] hover:text-[#D81B5D] transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Close
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Field Filter */}
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-[#121212] font-['Poppins']">
                      Job Field
                    </legend>
                    <div className="flex flex-wrap gap-2.5">
                      {Object.entries(FIELD_LABELS).slice(0, 6).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={activeFilters.field === value}
                          onClick={() => handleFilterChange('field', value)}
                          className={`min-h-[44px] px-4 rounded-full border text-sm font-['Inter'] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D81B5D] ${
                            activeFilters.field === value
                              ? 'bg-[#D81B5D] border-[#D81B5D] text-white shadow-[0_12px_24px_-18px_rgba(216,27,93,0.45)]'
                              : 'bg-white border-[#E7E7E7] text-[#6F6F6F] hover:border-[#D81B5D] hover:bg-[#FFF3F8] hover:text-[#D81B5D]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {/* Experience Filter */}
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-[#121212] font-['Poppins']">
                      Experience Level
                    </legend>
                    <div className="flex flex-wrap gap-2.5">
                      {Object.entries(EXPERIENCE_LABELS).slice(0, 4).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={activeFilters.experience === value}
                          onClick={() => handleFilterChange('experience', value)}
                          className={`min-h-[44px] px-4 rounded-full border text-sm font-['Inter'] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D81B5D] ${
                            activeFilters.experience === value
                              ? 'bg-[#D81B5D] border-[#D81B5D] text-white shadow-[0_12px_24px_-18px_rgba(216,27,93,0.45)]'
                              : 'bg-white border-[#E7E7E7] text-[#6F6F6F] hover:border-[#D81B5D] hover:bg-[#FFF3F8] hover:text-[#D81B5D]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {/* Location Filter */}
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold text-[#121212] font-['Poppins']">
                      Location
                    </legend>
                    <div className="relative">
                      <input
                        type="text"
                        value={activeFilters.location}
                        onChange={(e) => {
                          setActiveFilters({ ...activeFilters, location: e.target.value });
                        }}
                        onBlur={() => {
                          setCurrentPage(1);
                          updateURLParams({ ...activeFilters, page: 1 });
                          loadJobs({ ...activeFilters, page: 1 });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setCurrentPage(1);
                            updateURLParams({ ...activeFilters, page: 1 });
                            loadJobs({ ...activeFilters, page: 1 });
                          }
                        }}
                        placeholder="Enter city or country"
                        className="w-full h-12 rounded-[14px] border border-[#E7E7E7] bg-white/90 px-4 text-sm font-['Inter'] text-[#121212] placeholder:text-[#9C9C9C] shadow-[inset_0_1px_2px_rgba(18,18,18,0.04)] focus:outline-none focus:ring-2 focus:ring-[#D81B5D]/25 focus:border-[#D81B5D] transition-all"
                      />
                      <span className="mt-2 block text-xs text-[#9C9C9C] font-['Inter']">
                        We match roles based on the location you enter.
                      </span>
                    </div>
                  </fieldset>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className=" px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[#121212] font-['Poppins']">
                {loading ? 'Loading...' : `${pagination.total || 0} Jobs Found`}
              </h2>
              {hasActiveFilters && !loading && (
                <p className="text-sm text-[#7D7D7D] font-['Inter'] mt-1">
                  Showing filtered results
                </p>
              )}
            </div>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-[#FFF8FA] border border-[#FFDDE6] rounded-[32px] p-6 h-96">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-[#D9D9D9] rounded-full" />
                      <div className="flex-1">
                        <div className="h-6 bg-[#D9D9D9] rounded w-3/4 mb-2" />
                        <div className="h-4 bg-[#D9D9D9] rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-[#D9D9D9] rounded w-full" />
                      <div className="h-4 bg-[#D9D9D9] rounded w-5/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#FFF8FA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-[#D81B5D]" />
              </div>
              <h3 className="text-xl font-semibold text-[#121212] font-['Poppins'] mb-2">
                No jobs found
              </h3>
              <p className="text-[#7D7D7D] font-['Inter'] mb-6">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearAllFilters}
                  className="bg-[#D81B5D] hover:bg-[#D81B5D]/90 text-white"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div 
                ref={jobsGridRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {jobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    ref={(el) => (jobCardRefs.current[index] = el)}
                    index={index}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    variant="outline"
                    className="border-[#D9D9D9] text-[#7D7D7D] hover:border-[#D81B5D] hover:text-[#D81B5D] disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1;
                      // Show first, last, current, and neighbors
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            variant={currentPage === page ? 'default' : 'outline'}
                            className={`w-10 h-10 p-0 ${
                              currentPage === page
                                ? 'bg-[#D81B5D] text-white hover:bg-[#D81B5D]/90'
                                : 'border-[#D9D9D9] text-[#7D7D7D] hover:border-[#D81B5D] hover:text-[#D81B5D]'
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="text-[#7D7D7D]">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    variant="outline"
                    className="border-[#D9D9D9] text-[#7D7D7D] hover:border-[#D81B5D] hover:text-[#D81B5D] disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
