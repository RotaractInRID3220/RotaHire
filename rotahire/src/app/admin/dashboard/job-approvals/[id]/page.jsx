'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
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
  Edit3,
  FileText,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getJobDetails, approveJob, rejectJob, requestRevision } from '@/services/admin/adminJobService';

// Props: { params: { id: jobId } }
// Premium admin job detail review page with full job information and approval workflow
export default function JobDetailPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      console.log('No session, redirecting to login');
      router.push('/admin/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  // Fetches detailed job information
  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const details = await getJobDetails(id);
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

  // Handles job approval
  const handleApproveClick = async () => {
    console.log('Approve clicked - jobDetails:', jobDetails);
    
    if (!jobDetails) {
      toast.error('Job details not loaded');
      return;
    }

    try {
      setActionLoading(true);
      const jobId = jobDetails.id;
      
      console.log('Approving job:', jobId);
      
      const result = await approveJob(jobId, feedback || null);
      
      console.log('Approve result:', result);

      toast.success('Job approved successfully');
      setSelectedAction(null);
      setFeedback('');
      
      // Wait a moment for the toast to show, then navigate
      setTimeout(() => {
        router.push('/admin/dashboard/job-approvals');
      }, 1000);
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error?.message || 'Failed to approve job');
    } finally {
      setActionLoading(false);
    }
  };

  // Handles job rejection
  const handleRejectClick = async () => {
    console.log('Reject clicked - feedback:', feedback);
    
    if (!jobDetails) {
      toast.error('Job details not loaded');
      return;
    }

    if (!feedback || !feedback.trim()) {
      toast.error('Please provide feedback for rejection');
      return;
    }

    try {
      setActionLoading(true);
      const jobId = jobDetails.id;
      const trimmedFeedback = feedback.trim();
      
      console.log('Rejecting job:', jobId, 'with feedback:', trimmedFeedback);
      
      const result = await rejectJob(jobId, trimmedFeedback);
      
      console.log('Reject result:', result);

      toast.success('Job rejected successfully');
      setSelectedAction(null);
      setFeedback('');
      
      // Wait a moment for the toast to show, then navigate
      setTimeout(() => {
        router.push('/admin/dashboard/job-approvals');
      }, 1000);
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error(error?.message || 'Failed to reject job');
    } finally {
      setActionLoading(false);
    }
  };

  // Handles revision request
  const handleRevisionClick = async () => {
    console.log('Revision clicked - feedback:', feedback);
    
    if (!jobDetails) {
      toast.error('Job details not loaded');
      return;
    }

    if (!feedback || !feedback.trim()) {
      toast.error('Please provide feedback for revision request');
      return;
    }

    try {
      setActionLoading(true);
      const jobId = jobDetails.id;
      const trimmedFeedback = feedback.trim();
      
      console.log('Requesting revision for job:', jobId, 'with feedback:', trimmedFeedback);
      
      const result = await requestRevision(jobId, trimmedFeedback);
      
      console.log('Revision result:', result);

      toast.success('Revision requested successfully');
      setSelectedAction(null);
      setFeedback('');
      
      // Wait a moment for the toast to show, then navigate
      setTimeout(() => {
        router.push('/admin/dashboard/job-approvals');
      }, 1000);
    } catch (error) {
      console.error('Revision request error:', error);
      toast.error(error?.message || 'Failed to request revision');
    } finally {
      setActionLoading(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="h-8 px-3 flex items-center gap-2 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {jobDetails.status && jobDetails.status !== 'pending_approval' && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  jobDetails.status === 'approved'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {jobDetails.status === 'approved' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  {jobDetails.status === 'approved' ? 'Approved' : 'Rejected'}
                </div>
              )}
              <p className="text-xs text-gray-500">Posted {new Date(jobDetails.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Job Header - Clean & Refined */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
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

                    {/* Action Buttons - Only for pending jobs */}
                    {jobDetails.status !== 'approved' && jobDetails.status !== 'rejected' && (
                      <div className="flex flex-col gap-2 min-w-[170px]">
                        <Button
                          onClick={() => setSelectedAction('approve')}
                          className="h-9 bg-green-600 hover:bg-green-700 text-white font-semibold cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 rounded-lg text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Button
                            onClick={() => setSelectedAction('reject')}
                            className="h-8 border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 font-medium cursor-pointer transition-all duration-200 rounded-lg text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-0.5" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => setSelectedAction('revision')}
                            className="h-8 border border-orange-200 bg-white text-orange-600 hover:bg-orange-50 hover:border-orange-300 font-medium cursor-pointer transition-all duration-200 rounded-lg text-xs"
                          >
                            <Edit3 className="w-3 h-3 mr-0.5" />
                            Revise
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Status Badge - For approved/rejected jobs */}
                    {jobDetails.status && jobDetails.status !== 'pending_approval' && (
                      <div className="min-w-[170px]">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${
                          jobDetails.status === 'approved'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {jobDetails.status === 'approved' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          {jobDetails.status === 'approved' ? 'Approved' : 'Rejected'}
                        </div>
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
                  {jobDetails.job_skills && jobDetails.job_skills.length > 0 ? (
                    jobDetails.job_skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:shadow-sm hover:scale-105 cursor-default ${
                          skill.is_required
                            ? 'bg-[#D81B5D]/10 border-[#D81B5D]/20 text-[#D81B5D]'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {skill.skill_name}
                        {skill.is_required && <span className="ml-1 font-bold">•</span>}
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
          </div>

          {/* Sidebar - Company & Additional Info */}
          <div className="xl:col-span-1 space-y-5">
            {/* Company Information */}
            <section className="bg-white rounded-xl shadow-sm border-2 border-[#D81B5D]/20 overflow-hidden">
              <div className="px-5 lg:px-6 py-4 border-b border-gray-150/60 bg-gray-50/40">
                <h3 className="text-base font-bold text-gray-900">Company Profile</h3>
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
                        <p className="text-xs text-[#D81B5D]/70 font-medium">⚠️ Hidden from candidates</p>
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

            {/* Review History - Only if exists */}
            {jobDetails.job_reviews && jobDetails.job_reviews.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200/70 overflow-hidden">
                <div className="px-5 lg:px-6 py-4 border-b border-gray-150/60 bg-gray-50/40">
                  <h3 className="text-base font-bold text-gray-900">Review History</h3>
                </div>
                <div className="px-5 lg:px-6 py-5 space-y-3">
                  {jobDetails.job_reviews.map((review, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-150 hover:border-gray-200 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="font-bold text-gray-900 text-xs">
                          {review.admin_users
                            ? `${review.admin_users.first_name} ${review.admin_users.last_name}`
                            : `Admin ${review.admin_rmis_id}`
                          }
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            review.action === 'approved' ? 'bg-green-100 text-green-700' :
                            review.action === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {review.action.replace('_', ' ')}
                        </span>
                      </div>
                      {review.feedback && (
                        <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">{review.feedback}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
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
              {selectedAction === 'approve' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {selectedAction === 'reject' && <XCircle className="w-5 h-5 text-red-600" />}
              {selectedAction === 'revision' && <Edit3 className="w-5 h-5 text-orange-600" />}
              <span className="text-gray-900">
                {selectedAction === 'approve' ? 'Approve Job' :
                 selectedAction === 'reject' ? 'Reject Job' : 'Request Revision'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-medium">
              {selectedAction === 'approve' ? 'Job will be published on the platform' :
               selectedAction === 'reject' ? 'Company will be notified about rejection' :
               'Company will be asked to make changes'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="feedback" className="text-sm font-bold text-gray-900 block mb-2">
                {selectedAction === 'approve' ? 'Feedback (optional)' : 'Feedback'}
                {selectedAction !== 'approve' && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                id="feedback"
                placeholder={
                  selectedAction === 'approve' ? 'Add notes for company...' :
                  selectedAction === 'reject' ? 'Reason for rejection...' :
                  'Required changes...'
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="text-xs resize-none rounded-lg border-gray-200 focus:border-[#D81B5D] focus:ring-2 focus:ring-[#D81B5D]/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-150">
              <Button
                variant="outline"
                onClick={() => setSelectedAction(null)}
                disabled={actionLoading}
                className="h-8 px-4 text-xs font-medium rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  selectedAction === 'approve' ? handleApproveClick :
                  selectedAction === 'reject' ? handleRejectClick : handleRevisionClick
                }
                disabled={actionLoading || (selectedAction !== 'approve' && !feedback.trim())}
                className={`h-8 px-5 text-xs font-bold rounded-lg cursor-pointer text-white shadow-sm hover:shadow-md transition-all duration-200 ${
                  selectedAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  selectedAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoading ? (
                  <div className="flex items-center gap-1.5">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    {selectedAction === 'approve' && <Check className="w-4 h-4 mr-1" />}
                    {selectedAction === 'reject' && <X className="w-4 h-4 mr-1" />}
                    {selectedAction === 'revision' && <Edit3 className="w-4 h-4 mr-1" />}
                    {selectedAction === 'approve' ? 'Approve' :
                     selectedAction === 'reject' ? 'Reject' : 'Revise'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
