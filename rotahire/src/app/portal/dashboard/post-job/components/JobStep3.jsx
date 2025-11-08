'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ExternalLink, DollarSign, Zap, Clock } from 'lucide-react';
import { jobStep3Schema } from '@/schemas/jobSchema';

export default function JobStep3({ formData, updateFormData, onNext, onBack }) {

  const handleNext = () => {
    try {
      const stepData = {
        application_method: formData.application_method,
        external_application_url: formData.external_application_url || null,
        application_deadline: formData.application_deadline || null
      };

      jobStep3Schema.parse(stepData);
      onNext();
    } catch (error) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        toast.error('Please fill in all required fields');
      }
    }
  };

  const setQuickDeadline = (days) => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    updateFormData('application_deadline', deadline.toISOString());
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[#1E1E1E] font-['Poppins']">
          How candidates apply
        </h2>
        <p className="text-[#7D7D7D] font-['Inter']">
          Choose where and how candidates submit their applications
        </p>
      </div>

      {/* Application Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct Applications Card */}
        <button
          type="button"
          onClick={() => {
            updateFormData('application_method', 'direct');
            updateFormData('external_application_url', '');
          }}
          className={`p-6 rounded-xl border-2 transition-all duration-200 text-left group cursor-pointer
            ${formData.application_method === 'direct'
              ? 'border-[#D81B5D] bg-gradient-to-br from-[#FFF8FA] to-white shadow-lg'
              : 'border-[#D9D9D9] bg-white hover:border-[#D81B5D] hover:shadow-lg hover:scale-102'
            }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D81B5D] to-[#FF0057] rounded-lg 
              flex items-center justify-center text-white">
              <Zap className="w-6 h-6" />
            </div>
            {formData.application_method === 'direct' && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center 
                animate-pulse">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          <h3 className="font-bold font-['Poppins'] text-[#1E1E1E] mb-2 text-lg">
            RotaHire Direct
          </h3>
          <p className="text-sm text-[#7D7D7D] font-['Inter'] mb-4">
            Receive applications right in your dashboard
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
              <span>View CVs in dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
              <span>Track application status</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
              <span>Powerful candidate management</span>
            </div>
          </div>
        </button>

        {/* External Link Card */}
        <button
          type="button"
          onClick={() => updateFormData('application_method', 'external')}
          className={`p-6 rounded-xl border-2 transition-all duration-200 text-left group cursor-pointer
            ${formData.application_method === 'external'
              ? 'border-[#D81B5D] bg-gradient-to-br from-[#FFF8FA] to-white shadow-lg'
              : 'border-[#D9D9D9] bg-white hover:border-[#D81B5D] hover:shadow-lg hover:scale-102'
            }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-[#7D7D7D]" />
            </div>
            {formData.application_method === 'external' && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center 
                animate-pulse">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          <h3 className="font-bold font-['Poppins'] text-[#1E1E1E] mb-2 text-lg">
            External URL
          </h3>
          <p className="text-sm text-[#7D7D7D] font-['Inter'] mb-4">
            Direct candidates to your ATS or form
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#7D7D7D]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7D7D7D]" />
              <span>Use your existing system</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7D7D7D]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7D7D7D]" />
              <span>Custom application flow</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7D7D7D]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7D7D7D]" />
              <span>Full control over process</span>
            </div>
          </div>
        </button>
      </div>

      {/* External URL Input */}
      {formData.application_method === 'external' && (
        <div className="p-5 bg-gradient-to-r from-[#FFF8FA] to-white rounded-xl border-2 border-[#FFDDE6] space-y-3
          animate-in fade-in slide-in-from-top-2 duration-300">
          <Label htmlFor="external_url" className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
            Where should candidates apply? <span className="text-[#D81B5D]">*</span>
          </Label>
          <p className="text-xs text-[#999] font-['Inter']">
            Must be a secure HTTPS URL
          </p>
          <Input
            id="external_url"
            type="url"
            placeholder="https://your-company.com/careers/apply"
            value={formData.external_application_url}
            onChange={(e) => updateFormData('external_application_url', e.target.value)}
            className="h-12 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-2 focus:ring-[#D81B5D]
              font-['Inter'] cursor-pointer"
          />
          {formData.external_application_url && !formData.external_application_url.startsWith('https://') && (
            <p className="text-xs text-red-600 font-['Inter'] flex items-center gap-1">
              ⚠️ URL must start with https://
            </p>
          )}
        </div>
      )}

      {/* Application Deadline */}
      <div className="space-y-4 p-5 bg-gradient-to-r from-white to-[#F6F6F6] rounded-xl border border-[#D9D9D9]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#D81B5D]" />
          <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
            When do applications close? (Optional)
          </Label>
        </div>
        <p className="text-xs text-[#999] font-['Inter']">
          Default is 90 days. Choose when you want to stop accepting applications.
        </p>

        {/* Quick Select Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: '30 Days', days: 30 },
            { label: '60 Days', days: 60 },
            { label: '90 Days', days: 90 }
          ].map(({ label, days }) => (
            <Button
              key={days}
              type="button"
              variant="outline"
              onClick={() => setQuickDeadline(days)}
              className={`border-[#D81B5D] font-['Inter'] font-medium cursor-pointer transition-all
                ${formData.application_deadline &&
                  new Date(formData.application_deadline).getDate() - new Date().getDate() === days
                  ? 'bg-[#D81B5D] text-white border-[#D81B5D]'
                  : 'text-[#D81B5D] hover:bg-[#FFF8FA] border-[#D81B5D]'
                }`}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <Input
            type="datetime-local"
            value={formData.application_deadline ? formData.application_deadline.slice(0, 16) : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value).toISOString() : '';
              updateFormData('application_deadline', date);
            }}
            className="h-12 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-2 focus:ring-[#D81B5D]
              font-['Inter'] cursor-pointer"
          />

          {formData.application_deadline && (
            <p className="text-sm text-[#D81B5D] font-['Inter'] font-semibold flex items-center gap-2">
              <span>📅</span>
              Applications close on {formatDate(formData.application_deadline)}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-[#FFDDE6]">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-[#D81B5D] text-[#D81B5D] hover:bg-[#FFF8FA] font-['Poppins'] font-semibold
            px-8 h-12 cursor-pointer transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-[#D81B5D] to-[#FF0057] hover:from-[#FF0057] hover:to-[#D81B5D]
            text-white font-['Poppins'] font-semibold px-8 h-12 rounded-lg
            hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer
            flex items-center gap-2"
        >
          Next Step
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
