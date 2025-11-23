'use client';

import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Clock,
  DollarSign,
  Check,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const FIELD_LABELS = {
  software_engineering: 'Software Engineering',
  data_science: 'Data Science',
  design: 'Design',
  marketing: 'Marketing',
  sales: 'Sales',
  finance: 'Finance',
  human_resources: 'HR',
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

const MODE_LABELS = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site'
};

const EXPERIENCE_LABELS = {
  internship: 'Internship',
  entry_level: 'Entry Level',
  mid_level: 'Mid Level',
  senior_level: 'Senior Level',
  lead_level: 'Lead',
  executive: 'Executive'
};

const formatSalary = (salary) => {
  if (!salary) return null;
  const { min, max, currency } = salary;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
};

function JobCard({ job, ref, index }) {
  const router = useRouter();

  // Determine if this is a platform job or external application
  // External job: has a valid externalApplicationUrl
  // Platform job: no external URL (default)
  const isExternalJob = !!(job.externalApplicationUrl?.trim());
  const isPlatformJob = !isExternalJob;

  // Debug log
  if (index === 0) console.log('Job data:', { externalApplicationUrl: job.externalApplicationUrl, isExternalJob, isPlatformJob });

  const handleNavigate = useCallback(() => {
    router.push(`/jobs/${job.id}`);
  }, [router, job.id]);

  const handleApplyClick = useCallback((e) => {
    e.stopPropagation();
    
    if (isExternalJob) {
      // Open external link in new tab
      window.open(job.externalApplicationUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Navigate to job details page for platform jobs
      handleNavigate();
    }
  }, [handleNavigate, isExternalJob, job.externalApplicationUrl]);

  return (
    <div
      ref={ref}
      onClick={handleNavigate}
      className="group relative bg-white border border-[#E5E5E5] rounded-[16px] p-6 pb-16 transition-all duration-300 hover:border-[#D81B5D] hover:shadow-lg cursor-pointer h-full flex flex-col"
    >
      {/* Header: Company Logo + Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-[#FFF8FA] to-[#FFDDE6] rounded-[12px] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#FFDDE6]">
          {job.company.logo ? (
            <img 
              src={job.company.logo} 
              alt={job.company.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-2xl font-bold text-[#D81B5D] font-['Poppins']">
              {job.company.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-[#121212] font-['Poppins'] mb-1 truncate group-hover:text-[#D81B5D] transition-colors">
            {job.company.name}
          </h3>
          <p className="text-sm text-[#7D7D7D] font-['Inter'] truncate">
            {job.company.industry || 'Company'}
          </p>
        </div>
      </div>

      {/* Job Title */}
      <h2 className="text-xl font-bold text-[#121212] font-['Poppins'] mb-3 line-clamp-2 group-hover:text-[#D81B5D] transition-colors leading-tight">
        {job.title}
      </h2>

      {/* Tags: Field + Mode + Experience */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge 
          variant="secondary" 
          className="bg-[#FFF8FA] border border-[#FFDDE6] text-[#D81B5D] text-xs font-medium font-['Inter'] px-3 py-1"
        >
          {FIELD_LABELS[job.field]}
        </Badge>
        <Badge 
          variant="outline" 
          className="bg-white border-[#E5E5E5] text-[#7D7D7D] text-xs font-medium font-['Inter'] px-3 py-1"
        >
          {MODE_LABELS[job.mode]}
        </Badge>
        <Badge 
          variant="outline" 
          className="bg-white border-[#E5E5E5] text-[#7D7D7D] text-xs font-medium font-['Inter'] px-3 py-1"
        >
          {EXPERIENCE_LABELS[job.experienceLevel]}
        </Badge>
      </div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
        <div className="flex items-center gap-2 text-sm text-[#7D7D7D] font-['Inter']">
          <MapPin className="w-4 h-4 flex-shrink-0 text-[#D81B5D]" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#7D7D7D] font-['Inter']">
          <Clock className="w-4 h-4 flex-shrink-0 text-[#D81B5D]" />
          <span className="truncate">
            {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
          </span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-2 text-sm font-semibold text-[#121212] font-['Inter'] col-span-2">
            <DollarSign className="w-4 h-4 flex-shrink-0 text-[#D81B5D]" />
            <span className="truncate">{formatSalary(job.salary)}</span>
          </div>
        )}
      </div>

      {/* Apply Button - Absolute Positioning */}
      <Button
        onClick={handleApplyClick}
        className="absolute bottom-6 left-6 right-6 bg-[#D81B5D] hover:bg-[#C01850] text-white text-sm font-semibold py-2.5 h-auto rounded-[12px] font-['Poppins'] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        {isPlatformJob ? (
          <>
            <Check className="w-4 h-4" />
            Easy Apply
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            Apply Now
          </>
        )}
      </Button>
    </div>
  );
}

export default memo(JobCard);
