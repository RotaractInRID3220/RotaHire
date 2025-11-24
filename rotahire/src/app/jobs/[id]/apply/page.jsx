'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Search, Upload, X, FileText, Check, Loader2, User, Mail, Phone, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PhoneInput from '@/components/PhoneInput';
import { uploadCV, listUserCVs, deleteCV } from '@/services/cv/cvService';
import gsap from 'gsap';

export default function JobApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Member Lookup
  const [searchData, setSearchData] = useState({ rmisId: '', nic: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Step 2: Application Form
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    preferredName: '',
    email: '',
    mobile: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: ''
  });
  const [cvs, setCvs] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // CV label dialog
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [cvLabel, setCvLabel] = useState('');

  // Job data
  const [job, setJob] = useState(null);

  // Refs for animations
  const containerRef = useRef(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);

  // Load job details
  useEffect(() => {
    const loadJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`);
        const result = await response.json();

        if (result.success) {
          setJob(result.data);
        } else {
          toast.error('Failed to load job details');
          router.push('/jobs');
        }
      } catch (error) {
        toast.error('Failed to load job details');
        router.push('/jobs');
      }
    };

    loadJob();
  }, [params.id, router]);

  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power3.out'
      });
    }
  }, []);

  // Step transition animation
  useEffect(() => {
    if (step === 2 && step2Ref.current) {
      gsap.from(step2Ref.current, {
        opacity: 0,
        x: 20,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [step]);

  // Search for member
  const handleSearch = async () => {
    if (!searchData.rmisId && !searchData.nic) {
      toast.error('Please enter RMIS ID or NIC');
      return;
    }

    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchData.rmisId) params.append('rmisId', searchData.rmisId);
      if (searchData.nic) params.append('nic', searchData.nic);

      const response = await fetch(`/api/member-lookup?${params}`);
      const result = await response.json();

      if (result.success && result.members.length > 0) {
        setSearchResults(result.members);
        
        // Animate results
        setTimeout(() => {
          gsap.from('.member-card', {
            opacity: 0,
            y: 20,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out'
          });
        }, 50);
      } else {
        toast.error('No member found with the provided information');
        setSearchResults([]);
      }
    } catch (error) {
      toast.error('Failed to search member');
    } finally {
      setSearching(false);
    }
  };

  // Select member and proceed to step 2
  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setFormData({
      preferredName: member.fullName,
      email: member.email || '',
      mobile: member.mobile || '',
      linkedinUrl: member.linkedinUrl || '',
      githubUrl: member.githubUrl || '',
      portfolioUrl: member.portfolioUrl || ''
    });

    // Load existing CVs
    setLoading(true);
    try {
      const userCVs = await listUserCVs(member.membershipId);
      setCvs(userCVs);
    } catch (error) {
      console.error('Failed to load CVs:', error);
    } finally {
      setLoading(false);
    }

    setStep(2);
  };

  // Handle CV upload - show label dialog first
  const handleCVUpload = async (event, slotNumber) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Store file and slot for label dialog
    setPendingUpload({ file, slotNumber });
    setCvLabel('');
    setShowLabelDialog(true);
  };

  // Confirm CV upload with label
  const confirmCVUpload = async () => {
    if (!pendingUpload) return;
    
    const { file, slotNumber } = pendingUpload;
    setShowLabelDialog(false);
    setUploadingSlot(slotNumber);

    try {
      await uploadCV(file, selectedMember.membershipId, slotNumber, cvLabel || null);
      
      // Reload CVs list to reflect changes
      const userCVs = await listUserCVs(selectedMember.membershipId);
      setCvs(userCVs);
      
      toast.success('CV uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to upload CV');
    } finally {
      setUploadingSlot(null);
      setPendingUpload(null);
      setCvLabel('');
    }
  };

  // Delete CV
  const handleDeleteCV = async (cvId) => {
    try {
      await deleteCV(cvId);
      setCvs(cvs.filter(cv => cv.id !== cvId));
      if (selectedCV?.id === cvId) {
        setSelectedCV(null);
      }
      toast.success('CV deleted successfully');
    } catch (error) {
      toast.error('Failed to delete CV');
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.preferredName.trim()) {
      toast.error('Preferred name is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Valid email is required');
      return false;
    }
    if (!formData.mobile.trim()) {
      toast.error('Mobile number is required');
      return false;
    }
    if (!selectedCV) {
      toast.error('Please select a CV');
      return false;
    }

    // Validate LinkedIn if required
    if (job.requiresLinkedin && !formData.linkedinUrl.trim()) {
      toast.error('LinkedIn profile URL is required for this job');
      return false;
    }
    if (formData.linkedinUrl.trim() && !formData.linkedinUrl.match(/^https?:\/\/(www\.)?linkedin\.com\//)) {
      toast.error('Please enter a valid LinkedIn profile URL');
      return false;
    }

    // Validate GitHub if required
    if (job.requiresGithub && !formData.githubUrl.trim()) {
      toast.error('GitHub profile URL is required for this job');
      return false;
    }
    if (formData.githubUrl.trim() && !formData.githubUrl.match(/^https?:\/\/(www\.)?github\.com\//)) {
      toast.error('Please enter a valid GitHub profile URL');
      return false;
    }

    // Validate Portfolio if required
    if (job.requiresPortfolio && !formData.portfolioUrl.trim()) {
      toast.error('Portfolio URL is required for this job');
      return false;
    }
    if (formData.portfolioUrl.trim() && !formData.portfolioUrl.match(/^https?:\/\/.+/)) {
      toast.error('Please enter a valid portfolio URL');
      return false;
    }

    return true;
  };

  // Submit application
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setShowConfirmDialog(false);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/jobs/${params.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId: selectedMember.membershipId,
          fullName: selectedMember.fullName,
          preferredName: formData.preferredName,
          email: formData.email,
          mobile: formData.mobile,
          countryCode: formData.mobile.match(/^\+\d+/)?.[0] || '+94',
          nic: selectedMember.nic,
          clubId: selectedMember.clubId,
          cvId: selectedCV.id, // Reference to CV record in database
          linkedinUrl: formData.linkedinUrl || null,
          githubUrl: formData.githubUrl || null,
          portfolioUrl: formData.portfolioUrl || null
        })
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/jobs/apply/success?job=${job?.title || 'position'}`);
      } else {
        toast.error(result.error || 'Failed to submit application');
      }
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  // Get available CV slots
  const getAvailableSlots = () => {
    const usedSlots = cvs.map(cv => cv.slotNumber);
    return [1, 2, 3].filter(slot => !usedSlots.includes(slot));
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D81B5D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 md:py-12 md:px-6" ref={containerRef}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? router.back() : setStep(1)}
            className="mb-4 text-gray-600 hover:text-[#D81B5D]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-gray-600">{job.company?.company_name || 'Company'}</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-[#D81B5D]' : 'text-gray-400'}`}>
              Member Verification
            </span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-[#D81B5D]' : 'text-gray-400'}`}>
              Application Details
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D81B5D] transition-all duration-500 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Member Lookup */}
        {step === 1 && (
          <div ref={step1Ref} className="space-y-6">
            <Card className="p-6 md:p-8 bg-white border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-4">
                Verify Your Membership
              </h2>
              <p className="text-gray-600 mb-6">
                Enter your RMIS ID or NIC to verify your Rotaract membership
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="rmis">RMIS ID</Label>
                  <Input
                    id="rmis"
                    placeholder="e.g., 3220001"
                    value={searchData.rmisId}
                    onChange={(e) => setSearchData({ ...searchData, rmisId: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nic">NIC</Label>
                  <Input
                    id="nic"
                    placeholder="e.g., 123456789V"
                    value={searchData.nic}
                    onChange={(e) => setSearchData({ ...searchData, nic: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="border-gray-300"
                  />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={searching}
                className="w-full md:w-auto bg-[#D81B5D] hover:bg-[#FF0057] text-white"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search Member
                  </>
                )}
              </Button>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">
                  Found {searchResults.length} member{searchResults.length > 1 ? 's' : ''}
                </h3>
                {searchResults.map((member, index) => (
                  <Card
                    key={index}
                    className="member-card p-6 bg-[#FFF8FA] border-[#FFDDE6] hover:border-[#D81B5D] transition-all cursor-pointer"
                    onClick={() => handleSelectMember(member)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-black mb-2">
                          {member.fullName}
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>RMIS ID: {member.membershipId}</p>
                          <p>Club: {member.clubName}</p>
                          <p>NIC: {member.nic}</p>
                        </div>
                      </div>
                      <Button className="bg-[#D81B5D] hover:bg-[#FF0057] text-white">
                        Select
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Application Form */}
        {step === 2 && selectedMember && (
          <div ref={step2Ref} className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6 md:p-8 bg-white border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-6">
                Personal Information
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="fullName"
                      value={selectedMember.fullName}
                      disabled
                      className="pl-10 bg-gray-50 border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred Calling Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="preferredName"
                      value={formData.preferredName}
                      onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                      placeholder="How should we address you?"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>

                <PhoneInput
                  value={formData.mobile}
                  onChange={(value) => setFormData({ ...formData, mobile: value })}
                />

                <div className="space-y-2">
                  <Label htmlFor="nic">NIC</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="nic"
                      value={selectedMember.nic}
                      disabled
                      className="pl-10 bg-gray-50 border-gray-300"
                    />
                  </div>
                </div>

                {/* LinkedIn URL - Conditional based on job requirements */}
                {job?.requiresLinkedin && (
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      LinkedIn Profile URL
                      <span className="text-xs text-[#D81B5D] font-semibold">*Required</span>
                    </Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="border-gray-300"
                    />
                  </div>
                )}

                {/* GitHub URL - Conditional based on job requirements */}
                {job?.requiresGithub && (
                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center gap-2">
                      GitHub Profile URL
                      <span className="text-xs text-[#D81B5D] font-semibold">*Required</span>
                    </Label>
                    <Input
                      id="github"
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/yourusername"
                      className="border-gray-300"
                    />
                  </div>
                )}

                {/* Portfolio URL - Conditional based on job requirements */}
                {job?.requiresPortfolio && (
                  <div className="space-y-2">
                    <Label htmlFor="portfolio" className="flex items-center gap-2">
                      Portfolio URL
                      <span className="text-xs text-[#D81B5D] font-semibold">*Required</span>
                    </Label>
                    <Input
                      id="portfolio"
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      placeholder="https://yourportfolio.com"
                      className="border-gray-300"
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* CV Selection/Upload */}
            <Card className="p-6 md:p-8 bg-white border-gray-200">
              <h2 className="text-2xl font-semibold text-black mb-2">
                Curriculum Vitae (CV)
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                You can store up to 3 CVs. Select one to include with this application.
              </p>

              {/* Existing CVs */}
              {cvs.length > 0 && (
                <div className="space-y-3 mb-6">
                  {cvs.map((cv) => (
                    <div
                      key={cv.id}
                      className={`
                        p-4 rounded-lg border-2 transition-all cursor-pointer
                        ${selectedCV?.id === cv.id
                          ? 'border-[#D81B5D] bg-[#FFF8FA]'
                          : 'border-gray-200 bg-white hover:border-[#D81B5D]'
                        }
                      `}
                      onClick={() => setSelectedCV(cv)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${selectedCV?.id === cv.id
                              ? 'bg-[#D81B5D] text-white'
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}>
                            {selectedCV?.id === cv.id ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-black">
                              {cv.label || `CV #${cv.slotNumber}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(cv.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(cv.url, '_blank');
                            }}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCV(cv.id);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload New CV */}
              {cvs.length < 3 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Add New CV ({3 - cvs.length} slot{3 - cvs.length > 1 ? 's' : ''} available)
                  </p>
                  {getAvailableSlots().map((slot) => (
                    <label
                      key={slot}
                      className="
                        block p-6 border-2 border-dashed border-gray-300 rounded-lg
                        hover:border-[#D81B5D] hover:bg-[#FFF8FA]
                        transition-all cursor-pointer text-center
                      "
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleCVUpload(e, slot)}
                        disabled={uploadingSlot === slot}
                        className="hidden"
                      />
                      {uploadingSlot === slot ? (
                        <div className="flex items-center justify-center gap-2 text-[#D81B5D]">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <p className="text-sm font-medium text-gray-700">
                            Upload CV #{slot}
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF only, max 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </Card>

            {/* Submit Button */}
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={
                submitting || 
                !selectedCV || 
                (job?.requiresLinkedin && !formData.linkedinUrl.trim()) ||
                (job?.requiresGithub && !formData.githubUrl.trim()) ||
                (job?.requiresPortfolio && !formData.portfolioUrl.trim())
              }
              className="w-full bg-[#D81B5D] hover:bg-[#FF0057] text-white h-12 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Confirm Application Submission</DialogTitle>
              <DialogDescription>
                Please review your application details before submitting. You cannot edit after submission.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium text-black">{job.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Full Name:</span>
                <span className="font-medium text-black">{selectedMember?.fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-black">{formData.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CV:</span>
                <span className="font-medium text-black">{selectedCV?.label || `CV #${selectedCV?.slotNumber}`}</span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#D81B5D] hover:bg-[#FF0057] text-white"
              >
                Confirm & Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CV Label Dialog */}
        <Dialog open={showLabelDialog} onOpenChange={setShowLabelDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Add CV Label (Optional)</DialogTitle>
              <DialogDescription>
                Give your CV a descriptive name to easily identify it later. For example: "Software Engineer Resume" or "Marketing Portfolio".
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="cvLabel">CV Label</Label>
              <Input
                id="cvLabel"
                value={cvLabel}
                onChange={(e) => setCvLabel(e.target.value)}
                placeholder="e.g., Software Engineer Resume"
                className="mt-2 border-gray-300"
                maxLength={50}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmCVUpload();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                {cvLabel.length}/50 characters
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowLabelDialog(false);
                  setPendingUpload(null);
                  setCvLabel('');
                }}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmCVUpload}
                className="bg-[#D81B5D] hover:bg-[#FF0057] text-white"
              >
                Upload CV
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
