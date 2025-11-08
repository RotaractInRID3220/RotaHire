'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ChevronLeft, Upload, X, Eye, Briefcase, MapPin, DollarSign, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function JobStep4({ formData, updateFormData, onBack, onSubmit, isSubmitting }) {
  const [flyerPreview, setFlyerPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, and WebP are allowed');
      return;
    }

    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds 3MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFlyerPreview(event.target.result);
    };
    reader.readAsDataURL(file);

    updateFormData('job_flyer_file', file);
    toast.success('Flyer uploaded successfully!');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const removeFlyer = () => {
    setFlyerPreview(null);
    updateFormData('job_flyer_file', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const experienceLevelLabels = {
    internship: 'Internship',
    entry_level: 'Entry Level',
    mid_level: 'Mid Level',
    senior_level: 'Senior Level',
    lead_level: 'Lead Level',
    executive: 'Executive'
  };

  const fieldLabels = {
    software_engineering: 'Software Engineering',
    data_science: 'Data Science',
    design: 'Design',
    marketing: 'Marketing',
    sales: 'Sales',
    finance: 'Finance',
    human_resources: 'Human Resources',
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

  return (
    <div className="space-y-8">
      {/* Job Flyer Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-[#1E1E1E] font-['Poppins'] font-semibold text-sm">
              📸 Job Flyer (Optional but Recommended)
            </Label>
            <p className="text-xs text-[#999] font-['Inter'] mt-1">
              Eye-catching flyer makes your job 3x more likely to be viewed
            </p>
          </div>
        </div>

        {!flyerPreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 
              ${isDragOver
                ? 'border-[#D81B5D] bg-gradient-to-br from-[#FFF8FA] to-[#FFE8EE] scale-105'
                : 'border-[#D9D9D9] hover:border-[#D81B5D] hover:bg-[#FFF8FA]'
              }`}
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center 
              transition-all ${isDragOver ? 'bg-[#D81B5D]' : 'bg-[#FFDDE6]'}`}>
              <Upload className={`w-8 h-8 ${isDragOver ? 'text-white' : 'text-[#D81B5D]'}`} />
            </div>
            <p className="font-semibold font-['Poppins'] text-[#1E1E1E] mb-2">
              {isDragOver ? '✨ Drop your flyer here' : 'Drag & drop your flyer here'}
            </p>
            <p className="text-sm text-[#7D7D7D] font-['Inter']">
              or <span className="text-[#D81B5D] font-semibold">click to browse</span> • JPG, PNG, WebP • Max 3MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative group">
            <img
              src={flyerPreview}
              alt="Job flyer preview"
              className="w-full h-auto rounded-xl border-2 border-[#D9D9D9] shadow-lg 
                group-hover:shadow-xl transition-all object-cover"
              style={{ maxHeight: '300px' }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={removeFlyer}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 
                shadow-lg cursor-pointer transition-all opacity-0 group-hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Job Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1E1E1E] font-['Poppins']">
            Preview Your Job
          </h3>
          <Badge className="bg-gradient-to-r from-[#D81B5D] to-[#FF0057] text-white font-['Inter']">
            <Eye className="w-3 h-3 mr-1" />
            How it will look
          </Badge>
        </div>

        <Card className="border-[#D9D9D9] overflow-hidden shadow-lg hover:shadow-xl transition-all">
          <div className="p-8 space-y-6 bg-white">
            {/* Job Header */}
            <div>
              <h2 className="text-3xl font-bold text-[#1E1E1E] font-['Poppins'] mb-4">
                {formData.title || 'Job Title'}
              </h2>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-gradient-to-r from-[#D81B5D] to-[#FF0057] text-white font-['Inter']">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {fieldLabels[formData.field] || 'Field'}
                </Badge>
                <Badge variant="outline" className="border-[#D9D9D9] text-[#7D7D7D] font-['Inter']">
                  {experienceLevelLabels[formData.experience_level] || 'Level'}
                </Badge>
                <Badge variant="outline" className="border-[#D9D9D9] text-[#7D7D7D] font-['Inter']">
                  💼 {formData.mode}
                </Badge>
                {(formData.city || formData.country) && (
                  <Badge variant="outline" className="border-[#D9D9D9] text-[#7D7D7D] font-['Inter']">
                    <MapPin className="w-3 h-3 mr-1" />
                    {[formData.city, formData.country].filter(Boolean).join(', ')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Salary */}
            {(formData.min_salary || formData.max_salary) && (
              <div className="flex items-center gap-3 p-4 bg-[#FFF8FA] rounded-lg border border-[#FFDDE6]">
                <DollarSign className="w-5 h-5 text-[#D81B5D]" />
                <span className="text-[#1E1E1E] font-semibold font-['Inter']">
                  {formData.min_salary && formData.max_salary
                    ? `${formData.currency} ${formData.min_salary.toLocaleString()} - ${formData.max_salary.toLocaleString()}`
                    : formData.min_salary
                    ? `From ${formData.currency} ${formData.min_salary.toLocaleString()}`
                    : `Up to ${formData.currency} ${formData.max_salary.toLocaleString()}`}
                </span>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-[#1E1E1E] font-['Poppins']">About the role</h3>
              <p className="text-[#7D7D7D] font-['Inter'] text-sm leading-relaxed whitespace-pre-wrap">
                {formData.description || 'No description provided'}
              </p>
            </div>

            {/* Responsibilities */}
            {formData.responsibilities.filter(r => r.trim()).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-[#1E1E1E] font-['Poppins']">Key Responsibilities</h3>
                <ul className="space-y-1">
                  {formData.responsibilities
                    .filter(r => r.trim())
                    .map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[#7D7D7D] font-['Inter'] text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {formData.requirements.filter(r => r.trim()).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-[#1E1E1E] font-['Poppins']">Requirements</h3>
                <ul className="space-y-1">
                  {formData.requirements
                    .filter(r => r.trim())
                    .map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[#7D7D7D] font-['Inter'] text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {formData.skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-[#1E1E1E] font-['Poppins']">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      className="bg-[#FFF8FA] text-[#D81B5D] border border-[#FFDDE6] font-['Inter']"
                    >
                      🎯 {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="pt-4 border-t border-[#D9D9D9]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#1E1E1E] font-['Poppins'] mb-1">
                    How to apply
                  </h3>
                  <p className="text-sm text-[#7D7D7D] font-['Inter']">
                    {formData.application_method === 'direct'
                      ? '✨ Apply directly on RotaHire'
                      : `🔗 External: ${formData.external_application_url}`}
                  </p>
                </div>
                {formData.application_deadline && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-[#D81B5D] font-semibold font-['Inter']">
                      <Clock className="w-4 h-4" />
                      Closes soon
                    </div>
                    <p className="text-xs text-[#999]">
                      {new Date(formData.application_deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Important Notice */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 space-y-2">
        <h4 className="font-semibold text-blue-900 font-['Poppins'] flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          Admin Review Required
        </h4>
        <p className="text-sm text-blue-800 font-['Inter']">
          Your posting will be reviewed within 24-48 hours. You'll get notified once it's live!
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-[#FFDDE6]">
        <Button
          onClick={onBack}
          variant="outline"
          disabled={isSubmitting}
          className="border-[#D81B5D] text-[#D81B5D] hover:bg-[#FFF8FA] font-['Poppins'] font-semibold
            px-8 h-12 cursor-pointer transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#D81B5D] to-[#FF0057] hover:from-[#FF0057] hover:to-[#D81B5D]
            text-white font-['Poppins'] font-semibold px-8 h-12 rounded-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer
            flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Submitting...
            </>
          ) : (
            <>
              Submit for Approval
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}