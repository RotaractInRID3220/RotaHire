'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { jobStep1Schema } from '@/schemas/jobSchema';

// Combobox component for searchable fields
function FieldCombobox({ value, onValueChange, options, placeholder, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, options]);

  const selectedLabel = options.find(opt => opt.value === value)?.label;

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 bg-white border-2 border-[#D9D9D9] rounded-lg 
          hover:border-[#D81B5D] focus:outline-none focus:border-[#D81B5D] focus:ring-2 focus:ring-[#D81B5D] focus:ring-offset-1
          text-left flex items-center justify-between transition-all duration-200 cursor-pointer group"
      >
        <span className={selectedLabel ? 'text-[#1E1E1E] font-medium' : 'text-[#999]'}>
          {selectedLabel || placeholder}
        </span>
        <Search className="w-4 h-4 text-[#D81B5D] group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#D81B5D] rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-[#D9D9D9]">
              <input
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F6F6] border border-[#D9D9D9] rounded-md 
                  focus:outline-none focus:border-[#D81B5D] focus:ring-1 focus:ring-[#D81B5D]
                  text-sm font-['Inter']"
                autoFocus
              />
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onValueChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-4 py-3 text-left transition-all duration-150 border-l-4 font-['Inter']
                      ${value === option.value
                        ? 'bg-[#FFF8FA] border-[#D81B5D] text-[#D81B5D] font-semibold'
                        : 'border-transparent text-[#7D7D7D] hover:bg-[#F6F6F6] hover:text-[#1E1E1E] hover:border-[#D81B5D]'
                      }`}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-[#999] font-['Inter']">
                  No {label.toLowerCase()} found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function JobStep1({ formData, updateFormData, onNext }) {
  const [errors, setErrors] = useState({});
  
  const jobFields = [
    { value: 'software_engineering', label: 'Software Engineering' },
    { value: 'data_science', label: 'Data Science' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'finance', label: 'Finance' },
    { value: 'human_resources', label: 'Human Resources' },
    { value: 'operations', label: 'Operations' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'legal', label: 'Legal' },
    { value: 'customer_support', label: 'Customer Support' },
    { value: 'content_writing', label: 'Content Writing' },
    { value: 'other', label: 'Other' }
  ];

  const experienceLevels = [
    { value: 'internship', label: 'Internship (0-1 year)', description: 'Entry-level learning position' },
    { value: 'entry_level', label: 'Entry Level (0-2 years)', description: 'Basic responsibilities' },
    { value: 'mid_level', label: 'Mid Level (2-5 years)', description: 'Independent execution' },
    { value: 'senior_level', label: 'Senior Level (5-8 years)', description: 'Leadership & mentoring' },
    { value: 'lead_level', label: 'Lead Level (8+ years)', description: 'Strategic direction' },
    { value: 'executive', label: 'Executive (C-level)', description: 'Company-wide impact' }
  ];

  const workModes = [
    { value: 'remote', label: 'Remote', description: 'Work from anywhere' },
    { value: 'hybrid', label: 'Hybrid', description: 'Mix of office and remote' },
    { value: 'onsite', label: 'Onsite', description: 'Full-time at office' }
  ];

  // Validates and proceeds to next step
  const handleNext = () => {
    try {
      const stepData = {
        title: formData.title,
        field: formData.field,
        experience_level: formData.experience_level,
        mode: formData.mode,
        country: formData.country,
        city: formData.city
      };
      
      jobStep1Schema.parse(stepData);
      setErrors({});
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

  const showLocationFields = formData.mode === 'hybrid' || formData.mode === 'onsite';
  const completionPercentage = Math.round(
    (Number(!!formData.title) +
      Number(!!formData.field) +
      Number(!!formData.experience_level) +
      Number(!!formData.mode) +
      Number(!showLocationFields || (formData.country && formData.city))) * 20
  );

  return (
    <div className="space-y-8">
      {/* Completion Indicator */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#FFF8FA] to-white rounded-lg border border-[#FFDDE6]">
        <Sparkles className="w-5 h-5 text-[#D81B5D] flex-shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#1E1E1E]">Step 1 Progress</span>
            <span className="text-xs font-bold text-[#D81B5D]">{completionPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#FFDDE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D81B5D] to-[#FF0057] transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Job Title */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="title" className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
            What's the job title? <span className="text-[#D81B5D]">*</span>
          </Label>
          <span className="text-xs text-[#999] font-['Inter']">
            {formData.title.length}/100
          </span>
        </div>
        <Input
          id="title"
          placeholder="e.g., Senior React Developer"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          maxLength={100}
          className="h-12 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-2 focus:ring-[#D81B5D] focus:ring-offset-0
            font-['Inter'] placeholder:text-[#CCC] transition-all duration-200 cursor-pointer"
        />
        <p className="text-xs text-[#999] font-['Inter']">
          Be specific and clear to attract right candidates
        </p>
      </div>

      {/* Job Field with Combobox */}
      <div className="space-y-3">
        <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
          Choose a field <span className="text-[#D81B5D]">*</span>
        </Label>
        <FieldCombobox
          value={formData.field}
          onValueChange={(value) => updateFormData('field', value)}
          options={jobFields}
          placeholder="Search and select a field"
          label="field"
        />
        <p className="text-xs text-[#999] font-['Inter']">
          Helps candidates find your job in their field
        </p>
      </div>

      {/* Experience Level - Grid Cards */}
      <div className="space-y-3">
        <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
          Experience level <span className="text-[#D81B5D]">*</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => updateFormData('experience_level', level.value)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left group cursor-pointer
                ${formData.experience_level === level.value
                  ? 'border-[#D81B5D] bg-gradient-to-br from-[#FFF8FA] to-white shadow-md'
                  : 'border-[#D9D9D9] bg-white hover:border-[#D81B5D] hover:shadow-md hover:bg-[#F6F6F6]'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold font-['Poppins'] text-[#1E1E1E] text-sm">
                  {level.label}
                </span>
                {formData.experience_level === level.value && (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#D81B5D] to-[#FF0057] flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-[#7D7D7D] font-['Inter']">{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Work Mode - Visual Selection */}
      <div className="space-y-3">
        <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
          Work mode <span className="text-[#D81B5D]">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-4">
          {workModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => updateFormData('mode', mode.value)}
              className={`p-5 rounded-xl border-2 transition-all duration-200 text-center group cursor-pointer
                ${formData.mode === mode.value
                  ? 'border-[#D81B5D] bg-gradient-to-br from-[#FFF8FA] to-white shadow-lg'
                  : 'border-[#D9D9D9] bg-white hover:border-[#D81B5D] hover:shadow-md hover:scale-105'
                }`}
            >
              <p className="font-semibold font-['Poppins'] text-[#1E1E1E] text-sm">
                {mode.label}
              </p>
              <p className="text-xs text-[#999] font-['Inter'] mt-1">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Location Fields - Conditional */}
      {showLocationFields && (
        <div className="p-5 bg-gradient-to-r from-[#FFF8FA] to-white rounded-xl border-2 border-[#FFDDE6] space-y-4 
          animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D81B5D]" />
            <p className="text-sm font-semibold text-[#D81B5D] font-['Poppins']">
              Location required for {formData.mode === 'hybrid' ? 'Hybrid' : 'Onsite'} roles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
                Country <span className="text-[#D81B5D]">*</span>
              </Label>
              <Input
                id="country"
                placeholder="e.g., Sri Lanka"
                value={formData.country}
                onChange={(e) => updateFormData('country', e.target.value)}
                className="h-11 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-2 focus:ring-[#D81B5D]
                  font-['Inter'] cursor-pointer transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
                City <span className="text-[#D81B5D]">*</span>
              </Label>
              <Input
                id="city"
                placeholder="e.g., Colombo"
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
                className="h-11 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-2 focus:ring-[#D81B5D]
                  font-['Inter'] cursor-pointer transition-all duration-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t border-[#FFDDE6]">
        <Button
          onClick={handleNext}
          disabled={completionPercentage < 100}
          className="bg-gradient-to-r from-[#D81B5D] to-[#FF0057] hover:from-[#FF0057] hover:to-[#D81B5D] 
            text-white font-['Poppins'] font-semibold px-8 h-12 rounded-lg
            disabled:opacity-50 disabled:cursor-not-allowed
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
