'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { portalUserAtom } from '@/app/state/store';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { uploadImageToFirebase } from '@/lib/utils';
import { 
  CheckCircle, Building, Users, MapPin, Globe, Sparkles,
  Briefcase, User, Mail, Phone, FileText, Camera, Upload, Check, Heart, ArrowRight, ArrowLeft
} from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Welcome',
    description: 'Let\'s get your company set up',
    icon: Building
  },
  {
    id: 2,
    title: 'Company Details',
    description: 'Basic information about your company',
    icon: Building
  },
  {
    id: 3,
    title: 'Contact Information',
    description: 'How can candidates reach you?',
    icon: Users
  },
  {
    id: 4,
    title: 'Location & Industry',
    description: 'Where is your company based?',
    icon: MapPin
  },
  {
    id: 5,
    title: 'Company Profile',
    description: 'Tell us more about your organization',
    icon: Globe
  },
  {
    id: 6,
    title: 'Review & Complete',
    description: 'Review your information and finish setup',
    icon: CheckCircle
  }
];

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Media', 'Non-profit', 'Government', 'Other'
];

const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [portalUser] = useAtom(portalUserAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFileName, setLogoFileName] = useState(null);
  const [formData, setFormData] = useState({
    // Company Info
    company_name: '',
    company_email: portalUser?.email || '',
    company_website: '',
    company_logo_url: '',
    company_logo_file: null,
    industry: '',
    company_size: '',
    description: '',
    // Contact Person
    contact_person_name: '',
    contact_person_email: portalUser?.email || '',
    contact_person_mobile: '',
    contact_person_designation: '',
    // Location
    country: '',
    city: '',
    address: ''
  });

  const router = useRouter();

  useEffect(() => {
    // Simple CSS animations
    const stepContent = document.querySelector('.step-content');
    if (stepContent) {
      stepContent.style.opacity = '0';
      stepContent.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        stepContent.style.transition = 'all 0.3s ease-out';
        stepContent.style.opacity = '1';
        stepContent.style.transform = 'translateY(0)';
      }, 50);
    }
  }, [currentStep]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (file) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      try {
        // Show uploading state
        setIsDragOver(false);
        toast.loading('Uploading image...', { id: 'upload' });

        console.log('Starting upload process for file:', file.name, 'size:', file.size);

        // Upload to Firebase Storage
        const firebaseUrl = await uploadImageToFirebase(file, 'company-logos');
        console.log('Firebase upload successful, URL:', firebaseUrl);

        // Update form data with Firebase URL
        updateFormData('company_logo_url', firebaseUrl);
        updateFormData('company_logo_file', file);
        setLogoPreview(URL.createObjectURL(file)); // Use object URL for preview
        setLogoFileName(file.name);

        toast.success('Image uploaded successfully!', { id: 'upload' });
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error.message || 'Failed to upload image. Please try again.', { id: 'upload' });
      }
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Remove file object before sending to API
      const { company_logo_file, ...submitData } = formData;
      console.log('Submitting form data:', submitData);

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submitData,
          user_id: portalUser.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create company profile');
      }

      toast.success('Company profile created successfully!');
      router.push('/portal/dashboard?onboarding=completed');

    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to create company profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#D81B5D] to-[#FF0057] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Building className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 font-['Poppins']">
                Let's Build Your Profile
              </h2>
              <p className="text-base text-gray-600 font-['Inter'] max-w-lg mx-auto leading-relaxed">
                Create a compelling company profile that attracts top Rotaract talent. 
                Showcase your mission, values, and opportunities.
              </p>
            </div>
            <div className="flex justify-center flex-wrap gap-3">
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                5-Minute Setup
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border-blue-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                Free to Start
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-50 text-purple-700 border-purple-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                Premium Network
              </Badge>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D81B5D] to-[#FF0057] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-3">
                Company Information
              </h3>
              <p className="text-base text-gray-600 font-['Inter'] max-w-lg mx-auto">
                Share the essential details about your organization and help us understand your business better
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="company_name" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D81B5D] rounded-full"></span>
                  Company Name *
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => updateFormData('company_name', e.target.value)}
                  placeholder="Enter your company name"
                  className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="company_email" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D81B5D] rounded-full"></span>
                  Company Email *
                </Label>
                <Input
                  id="company_email"
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => updateFormData('company_email', e.target.value)}
                  placeholder="company@example.com"
                  className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="company_website" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                  Company Website
                </Label>
                <Input
                  id="company_website"
                  value={formData.company_website}
                  onChange={(e) => updateFormData('company_website', e.target.value)}
                  placeholder="https://www.company.com"
                  className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="industry" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D81B5D] rounded-full"></span>
                  Industry *
                </Label>
                <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                  <SelectTrigger className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md cursor-pointer">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-2 max-h-48">
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()} className="text-sm py-2 cursor-pointer h-10">
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2 space-y-3">
                <Label htmlFor="company_size" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-500" />
                  Company Size *
                </Label>
                <Select value={formData.company_size} onValueChange={(value) => updateFormData('company_size', value)}>
                  <SelectTrigger className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md cursor-pointer">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-2 max-h-48">
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size} className="text-sm py-2 cursor-pointer h-10">
                        {size} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#D81B5D] rounded-full"></span>
                Company Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Tell us about your company, mission, values, and what makes you unique. What drives your organization? What impact do you aim to make?"
                className="min-h-24 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg resize-none p-4"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 font-['Inter']">
                  {formData.description.length}/500 characters
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Be authentic and compelling</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="relative">
                <Briefcase className="mx-auto w-16 h-16 text-[#D81B5D] mb-3" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-['Poppins']">Contact & Legal Information</h2>
              <p className="text-base text-gray-600 font-['Inter'] max-w-lg mx-auto">Essential contact details and legal requirements for your business operations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="contact_person_name" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  Contact Person Name *
                </Label>
                <Input
                  id="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={(e) => updateFormData('contact_person_name', e.target.value)}
                  placeholder="Enter contact person's full name"
                  className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="contact_person_designation" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                  Designation *
                </Label>
                <Input
                  id="contact_person_designation"
                  value={formData.contact_person_designation}
                  onChange={(e) => updateFormData('contact_person_designation', e.target.value)}
                  placeholder="e.g., HR Manager, CEO, Recruiter"
                  className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="contact_person_email" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  Contact Email *
                </Label>
                <Input
                  id="contact_person_email"
                  type="email"
                  value={formData.contact_person_email}
                  onChange={(e) => updateFormData('contact_person_email', e.target.value)}
                  placeholder="contact@company.com"
                  className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="contact_person_mobile" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  Mobile Number
                </Label>
                <Input
                  id="contact_person_mobile"
                  value={formData.contact_person_mobile}
                  onChange={(e) => updateFormData('contact_person_mobile', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="relative">
                <MapPin className="mx-auto w-16 h-16 text-[#D81B5D] mb-3" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-['Poppins']">Location & Workspace</h2>
              <p className="text-base text-gray-600 font-['Inter'] max-w-lg mx-auto">Help us understand where your company operates and your workplace culture</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="country" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                  Country *
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                  placeholder="e.g., United States"
                  className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="city" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  City *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="e.g., New York"
                  className="h-12 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>

              <div className="lg:col-span-2 space-y-3">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-gray-500" />
                  Full Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  placeholder="Street address, building, floor, etc. Include any specific directions or landmarks that would help candidates find your office."
                  className="min-h-20 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg resize-none p-4"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="relative">
                <Sparkles className="mx-auto w-16 h-16 text-[#D81B5D] mb-3" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-['Poppins']">Brand & Identity</h2>
              <p className="text-base text-gray-600 font-['Inter'] max-w-lg mx-auto">Make your company stand out with compelling branding that attracts top talent</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  Enhanced Company Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Craft a compelling story about your company. What's your mission? What impact do you make? What makes your workplace special? How do you empower your team to grow?"
                  className="min-h-24 text-sm border-2 border-gray-300 focus:border-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md focus:shadow-lg resize-none p-4"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 font-['Inter']">
                    {formData.description.length}/500 characters
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Tell your story authentically</span>
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800 font-['Poppins'] flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-gray-500" />
                  Company Logo (Optional)
                </Label>
                <div 
                  className={`border-2 border-dashed transition-all duration-300 rounded-md p-6 text-center cursor-pointer ${
                    isDragOver 
                      ? 'border-[#D81B5D] bg-gray-50' 
                      : 'border-gray-300 hover:border-[#D81B5D] hover:bg-gray-50'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleFileSelect(e.dataTransfer.files[0]);
                  }}
                  onClick={() => document.getElementById('logo-upload').click()}
                >
                  {logoPreview ? (
                    <div className="space-y-3">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-20 h-20 object-contain mx-auto border border-gray-200 rounded-md"
                      />
                      <div className="space-y-1">
                        <p className="text-sm text-green-600 font-medium">✓ {logoFileName}</p>
                        <p className="text-xs text-gray-500">Logo will be uploaded when you complete setup</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="px-3 py-1 text-xs border-2 hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoPreview(null);
                            setLogoFileName(null);
                            updateFormData('company_logo_url', '');
                            updateFormData('company_logo_file', null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 font-['Inter']">
                        Drag and drop your logo here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 2MB • Recommended: 400x400px
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="px-4 py-2 text-sm border-2 hover:border-[#D81B5D] hover:text-[#D81B5D] transition-colors cursor-pointer rounded-md"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleFileSelect(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="relative">
                <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-3" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#D81B5D] rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-['Poppins']">Review & Launch</h2>
              <p className="text-base text-gray-600 font-['Inter'] max-w-lg mx-auto">Almost there! Review your company profile and launch your presence on RotaHire</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-gray-200 hover:border-[#D81B5D] transition-colors rounded-md shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-['Poppins'] text-lg flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#D81B5D]" />
                    Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Company Name</p>
                    <p className="font-['Inter'] text-sm text-gray-900">{formData.company_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Industry</p>
                    <p className="font-['Inter'] text-sm text-gray-900 capitalize">{formData.industry || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Company Size</p>
                    <p className="font-['Inter'] text-sm text-gray-900">{formData.company_size ? `${formData.company_size} employees` : 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-[#D81B5D] transition-colors rounded-md shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-['Poppins'] text-lg flex items-center gap-2">
                    <User className="w-4 h-4 text-[#D81B5D]" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Contact Person</p>
                    <p className="font-['Inter'] text-sm text-gray-900">{formData.contact_person_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Designation</p>
                    <p className="font-['Inter'] text-sm text-gray-900">{formData.contact_person_designation || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Email</p>
                    <p className="font-['Inter'] text-sm text-gray-900">{formData.contact_person_email || 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-[#D81B5D] transition-colors rounded-md shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-['Poppins'] text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D81B5D]" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Country</p>
                    <p className="font-['Inter'] text-sm text-gray-900">{formData.country || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">City</p>
                    <p className="font-['Inter'] text-sm text-gray-900">{formData.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Address</p>
                    <p className="font-['Inter'] text-xs text-gray-900">{formData.address || 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-[#D81B5D] transition-colors rounded-md shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-['Poppins'] text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D81B5D]" />
                    Company Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                    <p className="font-['Inter'] text-xs leading-relaxed text-gray-900">
                      {formData.description || 'Not provided'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900 font-['Poppins']">Ready to Launch!</h3>
              </div>
              <p className="text-sm text-gray-700 font-['Inter'] mb-4">
                Your company profile looks great! Click "Complete Setup" to publish your profile and start connecting with top Rotaract talent.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge className="px-3 py-1 text-xs bg-green-100 text-green-800 border border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Profile Complete
                </Badge>
                <Badge className="px-3 py-1 text-xs bg-blue-100 text-blue-800 border border-blue-300">
                  <Users className="w-3 h-3 mr-1" />
                  Ready for Candidates
                </Badge>
                <Badge className="px-3 py-1 text-xs bg-purple-100 text-purple-800 border border-purple-300">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium Network Access
                </Badge>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 2:
        return formData.company_name && formData.company_email && formData.industry && formData.company_size;
      case 3:
        return formData.contact_person_name && formData.contact_person_email && formData.contact_person_designation;
      case 4:
        return formData.country && formData.city;
      case 5:
        return formData.description;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-[#D81B5D] to-[#FF0057] rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-['Poppins'] text-2xl font-bold text-[#D81B5D]">Rota</span>
            <span className="font-['Courgette'] text-2xl text-[#D81B5D]">Hire</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-2">
          Welcome to Your Company Journey
        </h1>
        <p className="text-sm text-gray-600 font-['Inter'] max-w-lg mx-auto">
          Let's set up your company profile to connect with talented Rotaractors. This will only take a few minutes.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#D81B5D] text-white shadow-md'
                    : isCurrent
                    ? 'bg-[#D81B5D] text-white shadow-md scale-110'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center mt-2">
                  <p className={`text-xs font-medium font-['Poppins'] transition-colors duration-300 ${
                    isCompleted || isCurrent ? 'text-[#D81B5D]' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`absolute top-5 left-full w-12 h-0.5 transition-colors duration-300 ${
                    isCompleted ? 'bg-[#D81B5D]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-[#D81B5D] to-[#FF0057] h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="shadow-lg border-0 overflow-hidden rounded-xl">
        <CardContent className="p-8">
          <div className="step-content">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-4 py-2 text-sm font-semibold border-2 border-gray-300 hover:border-[#D81B5D] hover:text-[#D81B5D] transition-all duration-300 rounded-md shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
          <span className="text-sm text-gray-600 font-['Inter'] font-medium">
            Step {currentStep} of {steps.length}
          </span>
          <div className="w-24 bg-gray-300 rounded-full h-1 mt-1">
            <div
              className="bg-gradient-to-r from-[#D81B5D] to-[#FF0057] h-1 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#D81B5D] to-[#FF0057] hover:from-[#FF0057] hover:to-[#D81B5D] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isStepValid()}
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating Profile...
              </>
            ) : (
              <>
                Complete Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}