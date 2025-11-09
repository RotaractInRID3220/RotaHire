'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAtom } from 'jotai';
import { portalUserAtom } from '@/app/state/store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowLeft,
  Building,
  MapPin,
  DollarSign,
  Users,
  Globe,
  Mail,
  Briefcase,
  CheckCircle,
  XCircle,
  FileText,
  Check,
  X,
  ExternalLink,
  Play,
  Pause,
  Settings,
  Eye,
  EyeOff,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getCompanyJobDetails, updateJobStatus } from '@/services/jobs/jobService';

// Premium company job details page with modern design and company-specific actions
export default function CompanyJobDetailPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portalUser] = useAtom(portalUserAtom);

  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [closingJob, setClosingJob] = useState(false);
  const [reopeningJob, setReopeningJob] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Refs for animations
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const jobHeaderRef = useRef(null);
  const contentRefs = useRef([]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Button refs for micro-interactions
  const editButtonRef = useRef(null);
  const pauseButtonRef = useRef(null);
  const playButtonRef = useRef(null);

  // Button hover animations
  const handleButtonHover = (buttonRef, isHover) => {
    gsap.to(buttonRef.current, {
      scale: isHover ? 1.05 : 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  // Loading animation for action buttons
  const handleActionLoading = (buttonRef, isLoading) => {
    if (isLoading) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        opacity: 0.7,
        duration: 0.1
      });
    } else {
      gsap.to(buttonRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
      });
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      console.log('No session, redirecting to login');
      router.push('/portal/login');
    }
  }, [session, status, router]);

  // Initialize GSAP
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Page entrance animation - only on initial load
  useEffect(() => {
    if (!loading && jobDetails && !hasInitialLoad) {
      const tl = gsap.timeline();

      // Animate header section
      tl.fromTo(headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )
      // Animate job header card
      .fromTo(jobHeaderRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      )
      // Animate content sections with stagger
      .fromTo(contentRefs.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        },
        "-=0.3"
      );

      setHasInitialLoad(true);
    }
  }, [loading, jobDetails, hasInitialLoad]);

  // Handle button loading animations
  useEffect(() => {
    handleActionLoading(pauseButtonRef, closingJob);
  }, [closingJob]);

  useEffect(() => {
    handleActionLoading(playButtonRef, reopeningJob);
  }, [reopeningJob]);

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  // Fetches detailed job information for company
  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const details = await getCompanyJobDetails(portalUser?.id, id);
      console.log('Loaded job details:', details);
      setJobDetails(details);
    } catch (error) {
      console.error('Error loading job details:', error);
      toast.error('Failed to load job details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Handles closing a live job
  const handleCloseJob = async () => {
    if (!jobDetails) {
      toast.error('Job details not loaded');
      return;
    }

    try {
      setClosingJob(true);
      const result = await updateJobStatus(portalUser?.id, jobDetails.id, false);

      console.log('Close job result:', result);

      toast.success('Job closed successfully');
      setSelectedAction(null);
      setFeedback('');

      // Update local state
      setJobDetails(prev => prev ? { ...prev, is_active: false, display_status: 'approved-closed' } : null);

      // Wait a moment for the toast to show
      setTimeout(() => {
        setSelectedAction(null);
      }, 1000);
    } catch (error) {
      console.error('Close job error:', error);
      toast.error(error?.message || 'Failed to close job');
    } finally {
      setClosingJob(false);
    }
  };

  // Handles reopening a closed job
  const handleReopenJob = async () => {
    if (!jobDetails) {
      toast.error('Job details not loaded');
      return;
    }

    try {
      setReopeningJob(true);
      const result = await updateJobStatus(portalUser?.id, jobDetails.id, true);

      console.log('Reopen job result:', result);

      toast.success('Job reopened successfully');
      setSelectedAction(null);
      setFeedback('');

      // Update local state
      setJobDetails(prev => prev ? { ...prev, is_active: true, display_status: 'approved-live' } : null);

      // Wait a moment for the toast to show
      setTimeout(() => {
        setSelectedAction(null);
      }, 1000);
    } catch (error) {
      console.error('Reopen job error:', error);
      toast.error(error?.message || 'Failed to reopen job');
    } finally {
      setReopeningJob(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D81B5D]"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!jobDetails) return null;

  const companyDetails = jobDetails.company || {};

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      {/* Header Section - Matching job list page design */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
              title="Back to Jobs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-['Poppins']">
              Job Details
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm ${
            jobDetails.status === 'approved' && jobDetails.is_active
              ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60'
              : jobDetails.status === 'approved' && !jobDetails.is_active
              ? 'bg-blue-50/80 text-blue-700 border-blue-200/60'
              : jobDetails.status === 'pending_approval'
              ? 'bg-amber-50/80 text-amber-700 border-amber-200/60'
              : jobDetails.status === 'rejected'
              ? 'bg-red-50/80 text-red-700 border-red-200/60'
              : 'bg-gray-50/80 text-gray-700 border-gray-200/60'
          }`}>
            {jobDetails.status === 'approved' && jobDetails.is_active ? (
              <Play className="w-3 h-3" />
            ) : jobDetails.status === 'approved' && !jobDetails.is_active ? (
              <Pause className="w-3 h-3" />
            ) : jobDetails.status === 'pending_approval' ? (
              <Eye className="w-3 h-3" />
            ) : jobDetails.status === 'rejected' ? (
              <X className="w-3 h-3" />
            ) : (
              <Settings className="w-3 h-3" />
            )}
            <span>
              {jobDetails.status === 'approved' && jobDetails.is_active ? 'Live' :
               jobDetails.status === 'approved' && !jobDetails.is_active ? 'Closed' :
               jobDetails.status === 'pending_approval' ? 'Pending' :
               jobDetails.status === 'rejected' ? 'Rejected' : 'Draft'}
            </span>
          </div>
          <p className="text-xs text-gray-500">Posted {new Date(jobDetails.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Job Header - Modern glassmorphism design */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="p-7 lg:p-8">
          <div className="flex items-start gap-5 lg:gap-6">
                {/* Company Logo */}
                <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-[#D81B5D]/5 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200/70">
                  {companyDetails.company_logo_url ? (
                    <img
                      src={companyDetails.company_logo_url}
                      alt={companyDetails.company_name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Building className="w-10 h-10 text-[#D81B5D]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-5 mb-4">
                    <div className="flex-1 min-w-0">
                      {/* Title Section */}
                      <div className="mb-2.5">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-['Poppins'] leading-tight mb-1.5">
                          {jobDetails.title}
                        </h1>
                        <p className="text-base lg:text-lg text-gray-600 font-semibold">{companyDetails.company_name}</p>
                      </div>

                      {/* Key Stats - Enhanced Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3.5 pt-3.5 border-t border-gray-150/60">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-[#D81B5D]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Location</p>
                            <p className="text-xs font-semibold text-gray-900 truncate">{jobDetails.city || jobDetails.country || 'Remote'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-4 h-4 text-[#D81B5D]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Mode</p>
                            <p className="text-xs font-semibold text-gray-900 capitalize truncate">{jobDetails.mode}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-[#D81B5D]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Level</p>
                            <p className="text-xs font-semibold text-gray-900 capitalize truncate">{jobDetails.experience_level}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-4 h-4 text-[#D81B5D]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Salary</p>
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {jobDetails.salary_min ? `${jobDetails.salary_currency} ${jobDetails.salary_min.toLocaleString()}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Icon-only design matching job list page */}
                    <div className="flex flex-col gap-2 items-center">
                      {/* Edit Button - Only for editable jobs */}
                      {['draft', 'pending_approval'].includes(jobDetails.status) && (
                        <button
                          ref={editButtonRef}
                          onClick={() => router.push(`/portal/dashboard/jobs/${id}/edit`)}
                          onMouseEnter={() => handleButtonHover(editButtonRef, true)}
                          onMouseLeave={() => handleButtonHover(editButtonRef, false)}
                          className="h-8 w-8 p-0 border border-gray-200 hover:border-blue-500 hover:bg-blue-500 hover:text-white text-gray-600 bg-white transition-all duration-300 rounded-md cursor-pointer group/btn flex items-center justify-center"
                          title="Edit Job"
                        >
                          <Edit className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-all duration-200" />
                        </button>
                      )}

                      {/* Primary Actions */}
                      {jobDetails.status === 'approved' && jobDetails.is_active && (
                        <button
                          ref={pauseButtonRef}
                          onClick={() => setSelectedAction('close')}
                          onMouseEnter={() => handleButtonHover(pauseButtonRef, true)}
                          onMouseLeave={() => handleButtonHover(pauseButtonRef, false)}
                          className="h-8 w-8 p-0 border border-gray-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white text-gray-600 bg-white transition-all duration-300 rounded-md cursor-pointer group/btn flex items-center justify-center"
                          title="Close Job"
                        >
                          <Pause className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-all duration-200" />
                        </button>
                      )}

                      {jobDetails.status === 'approved' && !jobDetails.is_active && (
                        <button
                          ref={playButtonRef}
                          onClick={() => setSelectedAction('reopen')}
                          onMouseEnter={() => handleButtonHover(playButtonRef, true)}
                          onMouseLeave={() => handleButtonHover(playButtonRef, false)}
                          className="h-8 w-8 p-0 border border-gray-200 hover:border-green-500 hover:bg-green-500 hover:text-white text-gray-600 bg-white transition-all duration-300 rounded-md cursor-pointer group/btn flex items-center justify-center"
                          title="Reopen Job"
                        >
                          <Play className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-all duration-200" />
                        </button>
                      )}

                      {/* Status indicator for other states */}
                      {jobDetails.status === 'rejected' && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-red-100 text-red-800 border-red-200">
                          <X className="w-3 h-3" />
                          Rejected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Main Content - Single Flow Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-8">
            {/* Job Description */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
              <div className="px-6 lg:px-7 py-5 border-b border-gray-150/60 bg-gray-50/40">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-[#D81B5D]" />
                  </div>
                  Job Description
                </h2>
              </div>
              <div className="px-6 lg:px-7 py-6">
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {jobDetails.description}
                </div>
              </div>
            </section>

            {/* Responsibilities & Requirements - Combined */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <section className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
                <div className="px-6 lg:px-7 py-5 border-b border-gray-150/60 bg-gray-50/40">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-[#D81B5D]" />
                    </div>
                    Key Responsibilities
                  </h3>
                </div>
                <div className="px-6 lg:px-7 py-6">
                  {jobDetails.responsibilities ? (
                    <ul className="space-y-3">
                      {jobDetails.responsibilities.split('\n').filter(r => r.trim()).map((responsibility, index) => (
                        <li key={index} className="flex items-start gap-3 group">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D81B5D] mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-200" />
                          <span className="text-gray-700 text-xs leading-relaxed">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic text-xs">No responsibilities specified</p>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
                <div className="px-6 lg:px-7 py-5 border-b border-gray-150/60 bg-gray-50/40">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#D81B5D]" />
                    </div>
                    Requirements
                  </h3>
                </div>
                <div className="px-6 lg:px-7 py-6">
                  {jobDetails.requirements ? (
                    <ul className="space-y-3">
                      {jobDetails.requirements.split('\n').filter(r => r.trim()).map((requirement, index) => (
                        <li key={index} className="flex items-start gap-3 group">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D81B5D] mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-200" />
                          <span className="text-gray-700 text-xs leading-relaxed">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic text-xs">No requirements specified</p>
                  )}
                </div>
              </section>
            </div>

            {/* Skills Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
              <div className="px-6 lg:px-7 py-5 border-b border-gray-150/60 bg-gray-50/40">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-[#D81B5D]" />
                  </div>
                  Required Skills
                </h3>
              </div>
              <div className="px-6 lg:px-7 py-6">
                <div className="flex flex-wrap gap-2.5">
                  {jobDetails.skills && jobDetails.skills.length > 0 ? (
                    jobDetails.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:shadow-sm hover:scale-105 cursor-default ${
                          'bg-[#D81B5D]/10 border-[#D81B5D]/20 text-[#D81B5D]'
                        }`}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs">No skills specified</p>
                  )}
                </div>
              </div>
            </section>

            {/* Job Flyer - Only if exists */}
            {jobDetails.flyer_url && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
                <div className="px-6 lg:px-7 py-5 border-b border-gray-150/60 bg-gray-50/40">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#D81B5D]" />
                    </div>
                    Job Flyer
                  </h3>
                </div>
                <div className="px-6 lg:px-7 py-6">
                  <img
                    src={jobDetails.flyer_url}
                    alt="Job flyer"
                    className="w-full rounded-xl border border-gray-150 shadow-sm hover:shadow-md transition-shadow duration-300"
                  />
                </div>
              </section>
            )}

            {/* Review History - Only if reviews exist */}
            {jobDetails.review_history && jobDetails.review_history.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
                <div className="px-6 lg:px-7 py-5 border-b border-gray-150/60 bg-gray-50/40">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#D81B5D]" />
                    </div>
                    Review History
                  </h3>
                </div>
                <div className="px-6 lg:px-7 py-6">
                  <div className="space-y-4">
                    {jobDetails.review_history.map((review, index) => (
                      <div key={review.id} className="flex gap-4 pb-4 last:pb-0 border-b border-gray-100 last:border-b-0">
                        {/* Timeline indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                            review.action === 'approved' ? 'bg-green-500' :
                            review.action === 'rejected' ? 'bg-red-500' :
                            'bg-orange-500'
                          }`} />
                          {index < jobDetails.review_history.length - 1 && (
                            <div className="w-px h-full bg-gray-200 mt-2" />
                          )}
                        </div>

                        {/* Review content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  review.action === 'approved' ? 'bg-green-100 text-green-800' :
                                  review.action === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {review.action === 'approved' ? 'Approved' :
                                   review.action === 'rejected' ? 'Rejected' :
                                   'Revision Requested'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  by {review.admin_name}
                                </span>
                              </div>
                              {review.feedback && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.feedback}</p>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex-shrink-0">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Company & Additional Info */}
          <div className="xl:col-span-1 space-y-5">
            {/* Company Information */}
            <section className="bg-white rounded-xl shadow-sm border-2 border-[#D81B5D]/20 overflow-hidden">
              <div className="px-5 lg:px-6 py-4 border-b border-gray-150/60 bg-gray-50/40">
                <h3 className="text-base font-bold text-gray-900">Your Company</h3>
              </div>
              <div className="px-5 lg:px-6 py-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5">Company</p>
                  <p className="font-bold text-gray-900 text-sm">{companyDetails.company_name}</p>
                </div>

                {companyDetails.company_website && (
                  <div className="pt-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5">Website</p>
                    <a
                      href={companyDetails.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#D81B5D] hover:text-[#D81B5D]/80 font-medium text-xs group transition-colors duration-200"
                    >
                      <Globe className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="group-hover:underline">Visit</span>
                    </a>
                  </div>
                )}

                {companyDetails.company_email && (
                  <div className="pt-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5">Contact</p>
                    <a
                      href={`mailto:${companyDetails.company_email}`}
                      className="inline-flex items-center gap-2 text-[#D81B5D] hover:text-[#D81B5D]/80 font-medium text-xs group transition-colors duration-200 truncate"
                    >
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                      <span className="group-hover:underline truncate">{companyDetails.company_email}</span>
                    </a>
                  </div>
                )}

                {(jobDetails.job_posting_url || jobDetails.external_application_url) && (
                  <div className="pt-3 border-t border-gray-150/60">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Application Method</p>
                    <div className="space-y-1.5">
                      {jobDetails.job_posting_url && (
                        <div className="flex items-center justify-between p-2 bg-green-50/50 border border-green-200/60 rounded-md">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs font-medium text-green-800">Direct Apply</span>
                          </div>
                          <a
                            href={jobDetails.job_posting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 font-medium text-xs transition-all duration-200"
                          >
                            <span>Apply</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {jobDetails.external_application_url && (
                        <div className="flex items-center justify-between p-2 bg-blue-50/50 border border-blue-200/60 rounded-md">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-medium text-blue-800">External</span>
                          </div>
                          <a
                            href={jobDetails.external_application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium text-xs transition-all duration-200"
                          >
                            <span>Apply</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {companyDetails.industry && (
                  <div className="pt-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5">Industry</p>
                    <p className="text-gray-700 capitalize text-xs font-medium">{companyDetails.industry}</p>
                  </div>
                )}

                {companyDetails.description && (
                  <div className="pt-3 border-t border-gray-150/60">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1.5">About</p>
                    <p className="text-gray-700 text-xs leading-relaxed line-clamp-4">{companyDetails.description}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Salary Information - Only if exists */}
            {jobDetails.salary_min && (
              <section className="bg-[#D81B5D]/8 rounded-xl border border-[#D81B5D]/15 overflow-hidden">
                <div className="px-5 lg:px-6 py-4 border-b border-[#D81B5D]/10 bg-[#D81B5D]/5">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/15 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-[#D81B5D]" />
                    </div>
                    Salary
                  </h3>
                </div>
                <div className="px-5 lg:px-6 py-5">
                  <div className="space-y-2.5">
                    <div>
                      <p className="text-xl font-bold text-[#D81B5D]">
                        {jobDetails.salary_currency} {jobDetails.salary_min.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">
                        to {jobDetails.salary_currency} {jobDetails.salary_max ? jobDetails.salary_max.toLocaleString() : 'Negotiable'}
                      </p>
                    </div>
                    {!jobDetails.is_salary_disclosed && (
                      <div className="pt-1.5 border-t border-[#D81B5D]/15">
                        <p className="text-xs text-[#D81B5D]/70 font-medium flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5" />
                          Hidden from candidates
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Office Location - Only for hybrid/onsite */}
            {(jobDetails.mode === 'hybrid' || jobDetails.mode === 'onsite') && (jobDetails.location || jobDetails.city || jobDetails.country) && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
                <div className="px-5 lg:px-6 py-4 border-b border-gray-150/60 bg-gray-50/40">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#D81B5D]" />
                    </div>
                    Office Location
                  </h3>
                </div>
                <div className="px-5 lg:px-6 py-5">
                  <div className="space-y-1.5">
                    {jobDetails.location && (
                      <p className="text-gray-900 font-bold text-sm">{jobDetails.location}</p>
                    )}
                    {(jobDetails.city || jobDetails.country) && (
                      <p className="text-gray-600 text-xs font-medium">
                        {[jobDetails.city, jobDetails.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Job Statistics - For approved jobs */}
            {jobDetails.status === 'approved' && (
              <section className="bg-gradient-to-br from-[#D81B5D]/5 to-pink-50/50 rounded-xl border border-[#D81B5D]/15 overflow-hidden">
                <div className="px-5 lg:px-6 py-4 border-b border-[#D81B5D]/10 bg-[#D81B5D]/5">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#D81B5D]/15 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#D81B5D]" />
                    </div>
                    Job Performance
                  </h3>
                </div>
                <div className="px-5 lg:px-6 py-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#D81B5D]">0</p>
                      <p className="text-xs text-gray-600 font-medium">Applications</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#D81B5D]">0</p>
                      <p className="text-xs text-gray-600 font-medium">Views</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#D81B5D]/15">
                    <p className="text-xs text-[#D81B5D]/70 font-medium text-center">
                      Analytics coming soon
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Action Modal */}
        <Dialog open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
          <DialogContent className="max-w-sm rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                {selectedAction === 'close' && <Pause className="w-5 h-5 text-orange-600" />}
                {selectedAction === 'reopen' && <Play className="w-5 h-5 text-green-600" />}
                <span className="text-gray-900">
                  {selectedAction === 'close' ? 'Close Job Posting' : 'Reopen Job Posting'}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 font-medium">
                {selectedAction === 'close'
                  ? 'Job will no longer be visible to candidates but can be reopened later'
                  : 'Job will become visible to candidates again'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-1">{jobDetails.title}</p>
                <p className="text-xs text-gray-600">
                  {selectedAction === 'close'
                    ? 'This action can be reversed by reopening the job.'
                    : 'Job will resume accepting applications immediately.'
                  }
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-150">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAction(null)}
                  disabled={closingJob || reopeningJob}
                  className="h-8 px-4 text-xs font-medium rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={selectedAction === 'close' ? handleCloseJob : handleReopenJob}
                  disabled={closingJob || reopeningJob}
                  className={`h-8 px-5 text-xs font-bold rounded-lg cursor-pointer text-white shadow-sm hover:shadow-md transition-all duration-200 ${
                    selectedAction === 'close'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {closingJob || reopeningJob ? (
                    <div className="flex items-center gap-1.5">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      {selectedAction === 'close' ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                      {selectedAction === 'close' ? 'Close Job' : 'Reopen Job'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}