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
  Save,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  FileText,
  Upload,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  ChevronRight,
  Zap,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getCompanyJobDetails, updateJobDetails } from '@/services/jobs/jobService';

// Premium UX-optimized job edit page with modern design, smooth animations, and excellent UX flow
export default function EditJobPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portalUser] = useAtom(portalUserAtom);

  // State management
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: [],
    requirements: [],
    location: '',
    city: '',
    country: '',
    mode: '',
    experience_level: '',
    job_type: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'LKR',
    field: '',
    skills: [],
    accepts_direct_applications: true,
    external_application_url: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState({});
  const [flyerFile, setFlyerFile] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState(null);
  const [uploadingFlyer, setUploadingFlyer] = useState(false);

  // Animation refs
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const stepsRef = useRef([]);
  const contentRef = useRef(null);

  // Initialize GSAP
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Page entrance animation
  useEffect(() => {
    if (!loading && jobData) {
      const tl = gsap.timeline();

      // Header animation
      tl.fromTo(headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )
      // Steps animation
      .fromTo(stepsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" },
        "-=0.4"
      )
      // Content animation
      .fromTo(contentRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" },
        "-=0.3"
      );
    }
  }, [loading, jobData]);

  // Session check and data loading
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/portal/login');
      return;
    }
    loadJobData();
  }, [session, status, router]);

  // Load job data
  const loadJobData = async () => {
    try {
      setLoading(true);
      const data = await getCompanyJobDetails(portalUser?.id, id);
      setJobData(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        responsibilities: Array.isArray(data.responsibilities) 
          ? data.responsibilities 
          : (data.responsibilities ? data.responsibilities.split('\n').filter(item => item.trim()) : []),
        requirements: Array.isArray(data.requirements) 
          ? data.requirements 
          : (data.requirements ? data.requirements.split('\n').filter(item => item.trim()) : []),
        location: data.location || '',
        city: data.city || '',
        country: data.country || '',
        mode: data.mode || '',
        experience_level: data.experience_level || '',
        job_type: data.job_type || 'full_time',
        salary_min: data.salary_min || '',
        salary_max: data.salary_max || '',
        salary_currency: data.salary_currency || 'LKR',
        field: data.field || '',
        skills: data.skills || [],
        accepts_direct_applications: data.accepts_direct_applications !== false,
        external_application_url: data.external_application_url || ''
      });
      if (data.flyer_url) {
        setFlyerPreview(data.flyer_url);
      }
    } catch (error) {
      console.error('Error loading job data:', error);
      toast.error('Failed to load job data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes with validation clearing
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Add skill to list
  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
      toast.success('Skill added');
    }
  };

  // Remove skill from list
  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
    toast.success('Skill removed');
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (!formData.requirements || formData.requirements.filter(req => req.trim()).length === 0) {
      newErrors.requirements = 'At least one requirement is required';
    }
    if (!formData.mode) newErrors.mode = 'Work mode is required';
    if (!formData.experience_level) newErrors.experience_level = 'Experience level is required';
    if (!formData.field) newErrors.field = 'Job field is required';

    if (formData.salary_min && isNaN(formData.salary_min)) {
      newErrors.salary_min = 'Invalid salary amount';
    }
    if (formData.salary_max && isNaN(formData.salary_max)) {
      newErrors.salary_max = 'Invalid salary amount';
    }

    if (formData.accepts_direct_applications === false) {
      if (!formData.external_application_url || !formData.external_application_url.trim()) {
        newErrors.external_application_url = 'External application URL is required';
      } else {
        try {
          new URL(formData.external_application_url);
        } catch {
          newErrors.external_application_url = 'Please enter a valid URL';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSaving(true);
      const updatePayload = {
        ...formData,
        responsibilities: Array.isArray(formData.responsibilities) 
          ? formData.responsibilities.join('\n') 
          : formData.responsibilities,
        requirements: Array.isArray(formData.requirements) 
          ? formData.requirements.join('\n') 
          : formData.requirements
      };

      await updateJobDetails(portalUser?.id, id, updatePayload);
      toast.success('Job updated successfully!');
      
      // Animate success and redirect
      gsap.to(pageRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => router.push(`/portal/dashboard/jobs/${id}`)
      });
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error(error?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for managing responsibilities and requirements
  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  const updateResponsibility = (index, value) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((item, i) => i === index ? value : item)
    }));
  };

  const removeResponsibility = (index) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index, value) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((item, i) => i === index ? value : item)
    }));
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  // Handle flyer upload
  const handleFlyerSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFlyerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFlyerPreview(e.target.result);
        toast.success('Flyer selected');
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D81B5D]"></div>
          <p className="text-gray-600 font-medium">Loading job editor...</p>
        </div>
      </div>
    );
  }

  if (!jobData) return null;

  // Step configurations
  const steps = [
    { id: 'basic', label: 'Basic', icon: Briefcase },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'more', label: 'More', icon: MapPin },
    { id: 'salary', label: 'Salary', icon: DollarSign }
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-white py-8">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 space-y-8">
        {/* Header with back button */}
        <div ref={headerRef} className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-10 w-10 p-0 flex items-center justify-center hover:bg-gray-100 cursor-pointer border-gray-300"
            title="Back to Job"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-['Poppins']">
              Edit Job Posting
            </h1>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Indicators - Modern Card Design */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    ref={el => stepsRef.current[idx] = el}
                    onClick={() => setCurrentStep(step.id)}
                    className={`p-5 md:p-6 flex flex-col items-center justify-center gap-3 border-r border-gray-200 last:border-r-0 transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-[#D81B5D]/10 to-[#D81B5D]/5 shadow-inner'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-[#D81B5D] text-white shadow-lg shadow-[#D81B5D]/30'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm md:text-base font-semibold text-center transition-colors duration-300 ${
                      isActive
                        ? 'text-[#D81B5D]'
                        : 'text-gray-600'
                    }`}>
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area with smooth transitions */}
          <div ref={contentRef} className="space-y-6">
            {/* Basic Information Section */}
            {currentStep === 'basic' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#D81B5D]/10 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-[#D81B5D]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Job Basics</h2>
                      <p className="text-sm text-gray-500">Essential job information</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Job Title - Full Width */}
                    <div className="space-y-3 md:col-span-4">
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-900">
                        Job Title *
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="e.g., Senior React Developer"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`h-12 text-sm ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {errors.title && (
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {errors.title}
                        </div>
                      )}
                    </div>

                    {/* Job Field */}
                    <div className="space-y-3">
                      <Label htmlFor="field" className="text-sm font-semibold text-gray-900">
                        Job Field *
                      </Label>
                      <Select value={formData.field} onValueChange={(value) => handleInputChange('field', value)}>
                        <SelectTrigger id="field" className={`h-12 w-full cursor-pointer ${errors.field ? 'border-red-500 focus:ring-red-500' : ''}`}>
                          <SelectValue placeholder="Select job field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="human_resources">Human Resources</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.field && (
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {errors.field}
                        </div>
                      )}
                    </div>

                    {/* Work Mode */}
                    <div className="space-y-3">
                      <Label htmlFor="mode" className="text-sm font-semibold text-gray-900">
                        Work Mode *
                      </Label>
                      <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
                        <SelectTrigger id="mode" className={`h-12 w-full cursor-pointer ${errors.mode ? 'border-red-500 focus:ring-red-500' : ''}`}>
                          <SelectValue placeholder="Select work mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.mode && (
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {errors.mode}
                        </div>
                      )}
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-3">
                      <Label htmlFor="experience" className="text-sm font-semibold text-gray-900">
                        Experience Level *
                      </Label>
                      <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                        <SelectTrigger id="experience" className={`h-12 w-full cursor-pointer ${errors.experience_level ? 'border-red-500 focus:ring-red-500' : ''}`}>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="entry_level">Entry Level</SelectItem>
                          <SelectItem value="mid_level">Mid Level</SelectItem>
                          <SelectItem value="senior_level">Senior Level</SelectItem>
                          <SelectItem value="lead_level">Lead</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.experience_level && (
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {errors.experience_level}
                        </div>
                      )}
                    </div>

                    {/* Job Type */}
                    <div className="space-y-3">
                      <Label htmlFor="job_type" className="text-sm font-semibold text-gray-900">
                        Job Type *
                      </Label>
                      <Select value={formData.job_type} onValueChange={(value) => handleInputChange('job_type', value)}>
                        <SelectTrigger id="job_type" className="h-12 w-full cursor-pointer">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Job Details Section */}
            {currentStep === 'details' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#D81B5D]/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#D81B5D]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
                      <p className="text-sm text-gray-500">Description, responsibilities, and requirements</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Description */}
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
                        Job Description *
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the role and main responsibilities..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={6}
                        className={`text-sm resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {errors.description && (
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {errors.description}
                        </div>
                      )}
                    </div>

                    {/* Responsibilities */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-900">
                          Key Responsibilities
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addResponsibility}
                          className="h-8 px-3 text-xs border-gray-300 hover:border-[#D81B5D] hover:text-[#D81B5D] cursor-pointer"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {formData.responsibilities.map((responsibility, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex-1">
                              <Input
                                placeholder={`Responsibility ${index + 1}...`}
                                value={responsibility}
                                onChange={(e) => updateResponsibility(index, e.target.value)}
                                className="h-12 text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeResponsibility(index)}
                              className="h-12 px-3 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 cursor-pointer"
                              disabled={formData.responsibilities.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {formData.responsibilities.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No responsibilities added yet. Click "Add Item" to get started.</p>
                      )}
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-900">
                          Requirements *
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addRequirement}
                          className="h-8 px-3 text-xs border-gray-300 hover:border-[#D81B5D] hover:text-[#D81B5D] cursor-pointer"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {formData.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex-1">
                              <Input
                                placeholder={`Requirement ${index + 1}...`}
                                value={requirement}
                                onChange={(e) => updateRequirement(index, e.target.value)}
                                className={`h-12 text-sm ${errors.requirements ? 'border-red-500 focus:ring-red-500' : ''}`}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeRequirement(index)}
                              className="h-12 px-3 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 cursor-pointer"
                              disabled={formData.requirements.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {formData.requirements.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No requirements added yet. Click "Add Item" to get started.</p>
                      )}
                      {errors.requirements && (
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {errors.requirements}
                        </div>
                      )}
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <Label className="text-sm font-semibold text-gray-900">Required Skills</Label>
                      <div className="flex gap-3">
                        <Input
                          type="text"
                          placeholder="Add a skill..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="h-12 text-sm flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addSkill}
                          className="h-12 px-6 bg-[#D81B5D] hover:bg-[#FF0057] text-white font-semibold cursor-pointer"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-4">
                          {formData.skills.map((skill, idx) => (
                            <Badge
                              key={idx}
                              className="px-4 py-2 bg-[#D81B5D]/10 text-[#D81B5D] border border-[#D81B5D]/20 hover:bg-[#D81B5D]/20 transition-colors gap-2 cursor-pointer group text-sm"
                              onClick={() => removeSkill(skill)}
                            >
                              {skill}
                              <X className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location Section */}
                        {/* More Section - Location, Flyer, Application Method */}
            {currentStep === 'more' && (
              <div className="space-y-6">
                {/* Job Location - Only show for non-remote work */}
                {formData.mode !== 'remote' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-[#D81B5D]/10 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-[#D81B5D]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Job Location</h2>
                        <p className="text-sm text-gray-500">Where the job is based</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Specific Location */}
                      <div className="space-y-3">
                        <Label htmlFor="location" className="text-sm font-semibold text-gray-900">
                          Specific Address (Optional)
                        </Label>
                        <Input
                          id="location"
                          type="text"
                          placeholder="e.g., 123 Business Street, Suite 100"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="h-12 text-sm"
                        />
                      </div>

                      {/* City and Country Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="city" className="text-sm font-semibold text-gray-900">
                            City
                          </Label>
                          <Input
                            id="city"
                            type="text"
                            placeholder="e.g., Colombo"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="h-12 text-sm"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="country" className="text-sm font-semibold text-gray-900">
                            Country
                          </Label>
                          <Input
                            id="country"
                            type="text"
                            placeholder="e.g., Sri Lanka"
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            className="h-12 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Flyer Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#D81B5D]/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-[#D81B5D]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Job Flyer</h2>
                      <p className="text-sm text-gray-500">Upload a promotional image (Optional)</p>
                    </div>
                  </div>

                  {!flyerPreview && (
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFlyerSelect(e.dataTransfer.files[0]);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-gray-300 hover:border-[#D81B5D] hover:bg-[#D81B5D]/5 transition-all duration-300 cursor-pointer p-10 text-center"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFlyerSelect(e.target.files[0])}
                        className="hidden"
                        id="flyer-input"
                      />
                      <label htmlFor="flyer-input" className="cursor-pointer">
                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 rounded-xl bg-[#D81B5D]/10 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-[#D81B5D]" />
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 mb-2">Drop your flyer here</p>
                        <p className="text-sm text-gray-500">or click to browse</p>
                      </label>
                    </div>
                  )}

                  {flyerPreview && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Current Flyer</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFlyerFile(null);
                            setFlyerPreview(null);
                          }}
                          className="h-8 px-3 text-xs border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 cursor-pointer"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                      <img
                        src={flyerPreview}
                        alt="Job flyer preview"
                        className="w-full h-48 object-cover rounded-xl border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                {/* Application Method Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#D81B5D]/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#D81B5D]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Application Method</h2>
                      <p className="text-sm text-gray-500">How candidates should apply for this job</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Application Method Toggle */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-gray-900">Application Type</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Direct Applications */}
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange('accepts_direct_applications', true);
                            handleInputChange('external_application_url', '');
                          }}
                          className={`p-6 rounded-xl border-2 transition-all duration-200 text-left group cursor-pointer ${
                            formData.accepts_direct_applications
                              ? 'border-[#D81B5D] bg-gradient-to-br from-[#D81B5D]/5 to-[#D81B5D]/10 shadow-lg'
                              : 'border-gray-300 bg-white hover:border-[#D81B5D] hover:bg-[#D81B5D]/5'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-[#D81B5D]/10 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-[#D81B5D]" />
                            </div>
                            {formData.accepts_direct_applications && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">RotaHire Direct</h3>
                          <p className="text-sm text-gray-600">Receive applications through our platform</p>
                        </button>

                        {/* External Applications */}
                        <button
                          type="button"
                          onClick={() => handleInputChange('accepts_direct_applications', false)}
                          className={`p-6 rounded-xl border-2 transition-all duration-200 text-left group cursor-pointer ${
                            !formData.accepts_direct_applications
                              ? 'border-[#D81B5D] bg-gradient-to-br from-[#D81B5D]/5 to-[#D81B5D]/10 shadow-lg'
                              : 'border-gray-300 bg-white hover:border-[#D81B5D] hover:bg-[#D81B5D]/5'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ExternalLink className="w-6 h-6 text-gray-600" />
                            </div>
                            {!formData.accepts_direct_applications && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">External Link</h3>
                          <p className="text-sm text-gray-600">Direct candidates to your own application system</p>
                        </button>
                      </div>
                    </div>

                    {/* External URL Input */}
                    {!formData.accepts_direct_applications && (
                      <div className="space-y-3 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                        <Label htmlFor="external_url" className="text-sm font-semibold text-gray-900">
                          Application URL *
                        </Label>
                        <Input
                          id="external_url"
                          type="url"
                          placeholder="https://your-company.com/careers/apply"
                          value={formData.external_application_url}
                          onChange={(e) => handleInputChange('external_application_url', e.target.value)}
                          className={`h-12 text-sm ${errors.external_application_url ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.external_application_url && (
                          <div className="flex items-center gap-2 text-xs text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            {errors.external_application_url}
                          </div>
                        )}
                        <p className="text-xs text-gray-500">Must be a secure HTTPS URL</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Salary Section */}
            {currentStep === 'salary' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-[#D81B5D]/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-[#D81B5D]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Salary Information</h2>
                      <p className="text-sm text-gray-500">Define the compensation range</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Currency Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="currency" className="text-sm font-semibold text-gray-900">
                        Currency
                      </Label>
                      <Select value={formData.salary_currency} onValueChange={(value) => handleInputChange('salary_currency', value)}>
                        <SelectTrigger id="currency" className="h-12 w-full cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LKR">LKR (Sri Lankan Rupee)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Salary Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="salary_min" className="text-sm font-semibold text-gray-900">
                          Minimum Salary
                        </Label>
                        <Input
                          id="salary_min"
                          type="number"
                          placeholder="0"
                          value={formData.salary_min}
                          onChange={(e) => handleInputChange('salary_min', e.target.value)}
                          className={`h-12 text-sm ${errors.salary_min ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.salary_min && (
                          <div className="flex items-center gap-2 text-xs text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            {errors.salary_min}
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="salary_max" className="text-sm font-semibold text-gray-900">
                          Maximum Salary
                        </Label>
                        <Input
                          id="salary_max"
                          type="number"
                          placeholder="0"
                          value={formData.salary_max}
                          onChange={(e) => handleInputChange('salary_max', e.target.value)}
                          className={`h-12 text-sm ${errors.salary_max ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.salary_max && (
                          <div className="flex items-center gap-2 text-xs text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            {errors.salary_max}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Salary Display Preview */}
                    {(formData.salary_min || formData.salary_max) && (
                      <div className="p-6 bg-gradient-to-br from-[#D81B5D]/5 to-[#D81B5D]/10 rounded-xl border border-[#D81B5D]/20">
                        <p className="text-sm text-gray-600 mb-3">Salary Range Preview:</p>
                        <p className="text-3xl font-bold text-[#D81B5D]">
                          {formData.salary_currency} {formData.salary_min ? parseInt(formData.salary_min).toLocaleString() : '0'}
                          {formData.salary_max && ` - ${formData.salary_currency} ${parseInt(formData.salary_max).toLocaleString()}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full h-12 font-semibold border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-12 bg-[#D81B5D] hover:bg-[#FF0057] text-white font-semibold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center justify-center mt-4">
                <div className="flex items-center gap-2 text-xs text-red-600 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}