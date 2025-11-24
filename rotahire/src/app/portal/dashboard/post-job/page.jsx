'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { portalUserAtom } from '@/app/state/store';
import JobStep1 from './components/JobStep1';
import JobStep2 from './components/JobStep2';
import JobStep3 from './components/JobStep3';
import JobStep4 from './components/JobStep4';
import { createJob } from '@/services/jobs/jobService';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function PostJobPage() {
  const router = useRouter();
  const [portalUser] = useAtom(portalUserAtom);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1
    title: '',
    field: '',
    experience_level: '',
    mode: '',
    country: '',
    city: '',
    
    // Step 2
    description: '',
    responsibilities: [''],
    requirements: [''],
    skills: [],
    min_salary: null,
    max_salary: null,
    currency: 'LKR',
    is_salary_disclosed: false,
    require_github: false,
    require_linkedin: false,
    require_portfolio: false,
    
    // Step 3
    application_method: 'direct',
    external_application_url: '',
    application_deadline: '',
    
    // Step 4
    job_flyer_file: null,
    job_flyer_url: null,
    company_logo_override_url: null
  });

  const steps = [
    { number: 1, title: 'Job Type & Basic Info', description: 'Define the role basics' },
    { number: 2, title: 'Job Details & Requirements', description: 'Describe responsibilities and skills' },
    { number: 3, title: 'Application Settings', description: 'Configure how candidates apply' },
    { number: 4, title: 'Media & Review', description: 'Upload assets and review' }
  ];

  // Updates form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handles next step navigation
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handles previous step navigation
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Uploads job flyer to Firebase Storage
  const uploadJobFlyer = async (file) => {
    try {
      const timestamp = Date.now();
      const fileName = `job-flyers/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading job flyer:', error);
      throw new Error('Failed to upload job flyer');
    }
  };

  // Handles final form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if user is authenticated
      if (!portalUser?.id) {
        toast.error('User not authenticated');
        return;
      }
      
      // Upload job flyer if provided
      let jobFlyerUrl = null;
      if (formData.job_flyer_file) {
        toast.info('Uploading job flyer...');
        jobFlyerUrl = await uploadJobFlyer(formData.job_flyer_file);
      }
      
      // Prepare submission data
      const submissionData = {
        title: formData.title,
        field: formData.field,
        experience_level: formData.experience_level,
        mode: formData.mode,
        country: formData.country || null,
        city: formData.city || null,
        description: formData.description,
        responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        skills: formData.skills,
        min_salary: formData.min_salary ? parseFloat(formData.min_salary) : null,
        max_salary: formData.max_salary ? parseFloat(formData.max_salary) : null,
        currency: formData.currency,
        is_salary_disclosed: formData.is_salary_disclosed,
        require_github: formData.require_github,
        require_linkedin: formData.require_linkedin,
        require_portfolio: formData.require_portfolio,
        application_method: formData.application_method,
        external_application_url: formData.external_application_url || null,
        application_deadline: formData.application_deadline || null,
        job_flyer_url: jobFlyerUrl,
        company_logo_override_url: formData.company_logo_override_url || null
      };
      
      // Submit job posting with userId
      await createJob(portalUser.id, submissionData);
      
      toast.success('Job posted successfully! Awaiting admin approval.');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/portal/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting job:', error);
      toast.error(error.message || 'Failed to submit job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-[#F6F6F6] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/portal/dashboard')}
            className="mb-4 border-[#D81B5D] text-[#D81B5D] hover:bg-[#FFF8FA] hover:border-[#FF0057] 
              font-['Poppins'] font-medium px-6 h-11 cursor-pointer transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold text-[#1E1E1E] font-['Poppins'] mb-2">
            Post a New Job
          </h1>
          <p className="text-[#7D7D7D] font-['Inter']">
            Fill in the details below to create your job posting
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6 border-[#D9D9D9]">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                          currentStep > step.number
                            ? 'bg-green-500 text-white'
                            : currentStep === step.number
                            ? 'bg-[#D81B5D] text-white'
                            : 'bg-[#D9D9D9] text-[#7D7D7D]'
                        }`}
                      >
                        {currentStep > step.number ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <div className="mt-2 text-center hidden md:block">
                        <p className="text-xs font-medium font-['Poppins'] text-[#1E1E1E]">
                          {step.title}
                        </p>
                        <p className="text-xs text-[#7D7D7D] font-['Inter']">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 w-12 md:w-24 mx-2 transition-all ${
                          currentStep > step.number ? 'bg-green-500' : 'bg-[#D9D9D9]'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="border-[#D9D9D9]">
          <CardHeader>
            <CardTitle className="text-2xl font-['Poppins'] text-[#1E1E1E]">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="font-['Inter'] text-[#7D7D7D]">
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <JobStep1 
                formData={formData} 
                updateFormData={updateFormData}
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <JobStep2 
                formData={formData} 
                updateFormData={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <JobStep3 
                formData={formData} 
                updateFormData={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <JobStep4 
                formData={formData} 
                updateFormData={updateFormData}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
