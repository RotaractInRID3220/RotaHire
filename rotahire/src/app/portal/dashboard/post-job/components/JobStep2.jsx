'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, X, ChevronLeft, ChevronRight, Trash2, Sparkles, FileText, CheckCircle, Target, Wrench, Github, Users, Globe } from 'lucide-react';
import { jobStep2Schema } from '@/schemas/jobSchema';

export default function JobStep2({ formData, updateFormData, onNext, onBack }) {
  const [skillInput, setSkillInput] = useState('');

  const addResponsibility = () => {
    updateFormData('responsibilities', [...formData.responsibilities, '']);
  };

  const updateResponsibility = (index, value) => {
    const updated = [...formData.responsibilities];
    updated[index] = value;
    updateFormData('responsibilities', updated);
  };

  const removeResponsibility = (index) => {
    const updated = formData.responsibilities.filter((_, i) => i !== index);
    updateFormData('responsibilities', updated);
  };

  const addRequirement = () => {
    updateFormData('requirements', [...formData.requirements, '']);
  };

  const updateRequirement = (index, value) => {
    const updated = [...formData.requirements];
    updated[index] = value;
    updateFormData('requirements', updated);
  };

  const removeRequirement = (index) => {
    const updated = formData.requirements.filter((_, i) => i !== index);
    updateFormData('requirements', updated);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      updateFormData('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    updateFormData('skills', formData.skills.filter(skill => skill !== skillToRemove));
  };

  const handleNext = () => {
    try {
      const stepData = {
        description: formData.description,
        responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        skills: formData.skills,
        min_salary: formData.min_salary,
        max_salary: formData.max_salary,
        currency: formData.currency,
        is_salary_disclosed: formData.is_salary_disclosed,
        require_github: formData.require_github,
        require_linkedin: formData.require_linkedin,
        require_portfolio: formData.require_portfolio
      };

      jobStep2Schema.parse(stepData);
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

  const descCompleteness = Math.round((formData.description.length / 500) * 100);
  const respCompleteness = formData.responsibilities.filter(r => r.trim()).length;
  const reqCompleteness = formData.requirements.filter(r => r.trim()).length;
  const skillCompleteness = formData.skills.length;

  return (
    <div className="space-y-8">
      {/* Completion Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Description', value: descCompleteness, icon: FileText },
          { label: 'Responsibilities', value: respCompleteness, icon: CheckCircle },
          { label: 'Requirements', value: reqCompleteness, icon: Target },
          { label: 'Skills', value: skillCompleteness, icon: Wrench }
        ].map((metric, idx) => (
          <div
            key={idx}
            className="p-3 bg-gradient-to-br from-[#FFF8FA] to-white border border-[#FFDDE6] rounded-lg 
              text-center hover:shadow-md transition-all"
          >
            <div className="flex justify-center mb-1">
              <metric.icon className="w-6 h-6 text-[#D81B5D]" />
            </div>
            <div className="text-2xl font-bold text-[#D81B5D]">
              {typeof metric.value === 'number' && metric.value > 100 ? '✓' : metric.value + (typeof metric.value === 'number' ? '%' : '')}
            </div>
            <div className="text-xs text-[#999] font-['Inter']">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Job Description */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
            Tell us about the role <span className="text-[#D81B5D]">*</span>
          </Label>
          <span className="text-xs text-[#999] font-['Inter']">
            {formData.description.length}/5000
          </span>
        </div>
        <Textarea
          id="description"
          placeholder="Describe what the role is about, what the candidate will do, why this opportunity is special..."
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          maxLength={5000}
          className="min-h-[140px] border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-2 focus:ring-[#D81B5D]
            font-['Inter'] resize-none placeholder:text-[#CCC]"
        />
        <p className="text-xs text-[#999] font-['Inter']">
          Minimum 500 characters • Makes your posting stand out
        </p>
      </div>

      {/* Key Responsibilities */}
      <div className="space-y-3 p-5 bg-gradient-to-r from-white to-[#F6F6F6] rounded-xl border border-[#D9D9D9]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#D81B5D]" />
          <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
            Key Responsibilities <span className="text-[#D81B5D]">*</span>
          </Label>
          <span className="ml-auto text-xs text-[#999]">{respCompleteness}/3 minimum</span>
        </div>

        <div className="space-y-2.5">
          {formData.responsibilities.map((resp, idx) => (
            <div key={idx} className="flex gap-2 items-center group">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#D81B5D] text-white 
                flex items-center justify-center font-semibold text-xs">
                {idx + 1}
              </div>
              <Input
                placeholder={`What will they be responsible for?`}
                value={resp}
                onChange={(e) => updateResponsibility(idx, e.target.value)}
                className="flex-1 h-11 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-1 focus:ring-[#D81B5D]
                  font-['Inter'] cursor-pointer transition-all"
              />
              {formData.responsibilities.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResponsibility(idx)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer h-11 w-11 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {formData.responsibilities.length < 10 && (
          <Button
            type="button"
            variant="outline"
            onClick={addResponsibility}
            className="w-full border-[#D81B5D] text-[#D81B5D] hover:bg-[#FFF8FA] cursor-pointer
              h-10 font-['Inter'] font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Responsibility
          </Button>
        )}
      </div>

      {/* Requirements */}
      <div className="space-y-3 p-5 bg-gradient-to-r from-white to-[#F6F6F6] rounded-xl border border-[#D9D9D9]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#D81B5D]" />
          <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
            Requirements <span className="text-[#D81B5D]">*</span>
          </Label>
          <span className="ml-auto text-xs text-[#999]">{reqCompleteness}/3 minimum</span>
        </div>

        <div className="space-y-2.5">
          {formData.requirements.map((req, idx) => (
            <div key={idx} className="flex gap-2 items-center group">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#D81B5D] text-white 
                flex items-center justify-center font-semibold text-xs">
                {idx + 1}
              </div>
              <Input
                placeholder={`e.g., 3+ years of experience`}
                value={req}
                onChange={(e) => updateRequirement(idx, e.target.value)}
                className="flex-1 h-11 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-1 focus:ring-[#D81B5D]
                  font-['Inter'] cursor-pointer transition-all"
              />
              {formData.requirements.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRequirement(idx)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer h-11 w-11 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {formData.requirements.length < 8 && (
          <Button
            type="button"
            variant="outline"
            onClick={addRequirement}
            className="w-full border-[#D81B5D] text-[#D81B5D] hover:bg-[#FFF8FA] cursor-pointer
              h-10 font-['Inter'] font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Requirement
          </Button>
        )}
      </div>

      {/* Skills */}
      <div className="space-y-3 p-5 bg-gradient-to-r from-white to-[#F6F6F6] rounded-xl border border-[#D9D9D9]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#D81B5D]" />
          <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
            Required Skills <span className="text-[#D81B5D]">*</span>
          </Label>
          <span className="ml-auto text-xs text-[#999]">{skillCompleteness}/3 minimum</span>
        </div>

        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Type a skill (e.g., React, Node.js)"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            className="flex-1 h-11 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-1 focus:ring-[#D81B5D]
              font-['Inter'] cursor-pointer"
          />
          <Button
            type="button"
            onClick={addSkill}
            className="bg-[#D81B5D] hover:bg-[#FF0057] text-white h-11 px-6 cursor-pointer
              font-['Inter'] font-medium rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-[#FFDDE6]">
            {formData.skills.map((skill, idx) => (
              <Badge
                key={idx}
                className="px-3 py-1.5 bg-gradient-to-r from-[#D81B5D] to-[#FF0057] text-white
                  hover:shadow-md transition-all cursor-pointer font-['Inter']"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-red-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Salary Section */}
      <div className="p-5 bg-gradient-to-r from-[#F6F6F6] to-white rounded-xl border border-[#D9D9D9] space-y-4">
        <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
          💰 Compensation (Optional)
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="min_salary" className="text-xs font-semibold text-[#7D7D7D]">
              Minimum
            </Label>
            <Input
              id="min_salary"
              type="number"
              placeholder="0"
              value={formData.min_salary || ''}
              onChange={(e) => updateFormData('min_salary', e.target.value ? parseFloat(e.target.value) : null)}
              className="h-11 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-1 focus:ring-[#D81B5D]
                font-['Inter'] cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_salary" className="text-xs font-semibold text-[#7D7D7D]">
              Maximum
            </Label>
            <Input
              id="max_salary"
              type="number"
              placeholder="0"
              value={formData.max_salary || ''}
              onChange={(e) => updateFormData('max_salary', e.target.value ? parseFloat(e.target.value) : null)}
              className="h-11 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-1 focus:ring-[#D81B5D]
                font-['Inter'] cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-xs font-semibold text-[#7D7D7D]">
              Currency
            </Label>
            <Input
              id="currency"
              value={formData.currency}
              onChange={(e) => updateFormData('currency', e.target.value)}
              className="h-11 border-[#D9D9D9] focus:border-[#D81B5D] focus:ring-1 focus:ring-[#D81B5D]
                font-['Inter'] cursor-pointer"
            />
          </div>
        </div>

        {/* Salary Visibility Toggle */}
        <label className="flex items-center space-x-3 p-3 border-2 border-[#D9D9D9] rounded-lg 
          hover:border-[#D81B5D] hover:bg-[#FFF8FA] cursor-pointer transition-all group">
          <input
            type="checkbox"
            checked={formData.is_salary_disclosed || false}
            onChange={(e) => updateFormData('is_salary_disclosed', e.target.checked)}
            className="w-5 h-5 text-[#D81B5D] border-[#D9D9D9] rounded focus:ring-[#D81B5D] cursor-pointer"
          />
          <span className="font-medium font-['Inter'] text-[#1E1E1E] group-hover:text-[#D81B5D]">
            Show salary to candidates
          </span>
        </label>
      </div>

      {/* Additional Requirements */}
      <div className="space-y-3">
        <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
          Additional Requirements
        </Label>

        <div className="space-y-2">
          {[
            { key: 'require_github', label: 'GitHub profile', icon: Github },
            { key: 'require_linkedin', label: 'LinkedIn profile', icon: Users },
            { key: 'require_portfolio', label: 'Portfolio website', icon: Globe }
          ].map(({ key, label, icon: IconComponent }) => (
            <label
              key={key}
              className="flex items-center space-x-3 p-3 border-2 border-[#D9D9D9] rounded-lg 
                hover:border-[#D81B5D] hover:bg-[#FFF8FA] cursor-pointer transition-all group"
            >
              <input
                type="checkbox"
                checked={formData[key]}
                onChange={(e) => updateFormData(key, e.target.checked)}
                className="w-5 h-5 text-[#D81B5D] border-[#D9D9D9] rounded focus:ring-[#D81B5D] cursor-pointer"
              />
              <IconComponent className="w-5 h-5 text-[#D81B5D]" />
              <span className="font-medium font-['Inter'] text-[#1E1E1E] group-hover:text-[#D81B5D]">
                Require {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-[#FFDDE6]">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-[#D81B5D] text-[#D81B5D] hover:bg-[#FFF8FA] font-['Poppins'] font-semibold h-12 px-8
            cursor-pointer transition-all"
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
