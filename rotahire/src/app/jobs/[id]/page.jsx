'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Laptop,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Check,
  Building2,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getJobById } from '@/services/jobs/jobService';
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

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refs for animations
  const heroRef = useRef(null);
  const detailsRef = useRef(null);
  const requirementsRef = useRef(null);
  const responsibilitiesRef = useRef(null);
  const flyerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Load job details
  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const data = await getJobById(params.id);
        setJob(data);
      } catch (error) {
        console.error('Error loading job:', error);
        toast.error('Failed to load job details');
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadJob();
    }
  }, [params.id, router]);

  // Hero animation
  useEffect(() => {
    if (!loading && job && heroRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(heroRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
      });
      return () => ctx.revert();
    }
  }, [loading, job]);

  // Scroll-triggered animations for sections
  useEffect(() => {
    if (!loading && job) {
      const ctx = gsap.context(() => {
        const sections = [detailsRef.current, requirementsRef.current, responsibilitiesRef.current, flyerRef.current].filter(Boolean);
        
        sections.forEach((section, index) => {
          gsap.fromTo(section,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        });
      });
      return () => ctx.revert();
    }
  }, [loading, job]);

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

  const handleApply = () => {
    if (job?.externalApplicationUrl) {
      window.open(job.externalApplicationUrl, '_blank', 'noopener,noreferrer');
    } else {
      router.push(`/jobs/${params.id}/apply`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cranberry"></div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const isExternalJob = job.externalApplicationUrl && job.externalApplicationUrl.trim() !== '';

  return (
    <div className="min-h-screen bg-white pt-5">
      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-20 xl:px-24 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Two Column Layout for Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
            
            {/* LEFT SIDEBAR - Company & Quick Info */}
            <aside className="space-y-6">
              
              {/* Company Card */}
              <div ref={heroRef} className="bg-[#FFF8FA] border border-[#FFDDE6] rounded-[16px] p-6">
                {/* Company Logo */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-white to-[#FFDDE6] rounded-[12px] flex items-center justify-center overflow-hidden border border-[#FFDDE6] shadow-sm">
                    {job.company.logo ? (
                      <img 
                        src={job.company.logo} 
                        alt={`${job.company.name} logo`}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    ) : (
                      <div className="text-3xl font-bold text-[#D81B5D] font-['Poppins']">
                        {job.company.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Name */}
                <h2 className="text-lg font-semibold text-[#121212] text-center font-['Poppins'] mb-1">
                  {job.company.name}
                </h2>
                
                {/* Company Industry */}
                {job.company.industry && (
                  <p className="text-sm text-[#7D7D7D] text-center font-['Inter'] mb-4">
                    {job.company.industry}
                  </p>
                )}

                {/* Divider */}
                <div className="h-px bg-[#FFDDE6] my-4"></div>

                {/* Posted Date */}
                <div className="flex items-center justify-center gap-2 text-[#FFA4BC] text-sm font-['Inter']">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <time dateTime={job.postedAt}>
                    Posted {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                  </time>
                </div>
              </div>

              {/* Job Overview Card */}
              <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-6">
                <h3 className="text-base font-semibold text-[#121212] font-['Poppins'] mb-4">Job Overview</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-[#D81B5D] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#7D7D7D] font-['Inter'] mb-0.5">Location</p>
                      <p className="text-sm text-[#121212] font-['Inter'] font-medium">{job.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 flex-shrink-0 text-[#D81B5D] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#7D7D7D] font-['Inter'] mb-0.5">Field</p>
                      <p className="text-sm text-[#121212] font-['Inter'] font-medium">{FIELD_LABELS[job.field]}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 flex-shrink-0 text-[#D81B5D] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#7D7D7D] font-['Inter'] mb-0.5">Experience Level</p>
                      <p className="text-sm text-[#121212] font-['Inter'] font-medium">{EXPERIENCE_LABELS[job.experienceLevel]}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Laptop className="w-4 h-4 flex-shrink-0 text-[#D81B5D] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#7D7D7D] font-['Inter'] mb-0.5">Work Mode</p>
                      <p className="text-sm text-[#121212] font-['Inter'] font-medium">{MODE_LABELS[job.mode]}</p>
                    </div>
                  </div>

                  {job.salary && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-4 h-4 flex-shrink-0 text-[#D81B5D] mt-0.5" />
                      <div>
                        <p className="text-xs text-[#7D7D7D] font-['Inter'] mb-0.5">Salary Range</p>
                        <p className="text-sm text-[#121212] font-['Inter'] font-semibold">{formatSalary(job.salary)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Button */}
              {/* <Button
                onClick={handleApply}
                className="w-full bg-[#D81B5D] hover:bg-[#C01850] text-white text-sm font-semibold py-2.5 h-auto rounded-[12px] font-['Poppins'] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                {isExternalJob ? (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Apply Now
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Easy Apply
                  </>
                )}
              </Button> */}

              {/* Job Flyer - Desktop */}
              {job.flyerUrl && (
                <div ref={flyerRef} className="hidden lg:block bg-white border border-[#E5E5E5] rounded-[16px] p-4 overflow-hidden">
                  <h3 className="text-base font-semibold text-[#121212] font-['Poppins'] mb-3">Job Flyer</h3>
                  <div 
                    className="relative group cursor-pointer rounded-[12px] overflow-hidden" 
                    onClick={() => window.open(job.flyerUrl, '_blank', 'noopener,noreferrer')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.open(job.flyerUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    aria-label="View full-size job flyer in new tab"
                  >
                    <img 
                      src={job.flyerUrl} 
                      alt="Job posting flyer with additional details"
                      className="w-full h-auto rounded-[12px] transition-all duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[12px] flex items-end justify-center pb-4">
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-[#D81B5D]" />
                        <span className="text-xs font-medium text-[#121212] font-['Inter']">View Full Size</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </aside>

            {/* RIGHT CONTENT - Job Details */}
            <main className="space-y-6">
              
              {/* Job Title & Apply Button Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl lg:text-4xl font-bold text-[#121212] font-['Poppins'] mb-3 leading-tight">
                    {job.title}
                  </h1>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                  <Badge 
                    className="bg-[#FFF8FA] border border-[#FFDDE6] text-[#D81B5D] text-xs font-medium font-['Inter'] px-3 py-1 rounded-full"
                  >
                    {FIELD_LABELS[job.field]}
                  </Badge>
                  <Badge 
                    className="bg-white border border-[#E5E5E5] text-[#7D7D7D] text-xs font-medium font-['Inter'] px-3 py-1 rounded-full"
                  >
                    {MODE_LABELS[job.mode]}
                  </Badge>
                  <Badge 
                    className="bg-white border border-[#E5E5E5] text-[#7D7D7D] text-xs font-medium font-['Inter'] px-3 py-1 rounded-full"
                  >
                    {EXPERIENCE_LABELS[job.experienceLevel]}
                  </Badge>
                  </div>
                </div>
                
                {/* Desktop Apply Button - Top Right */}
                <div className="hidden lg:block flex-shrink-0">
                  <Button
                    onClick={handleApply}
                    className="bg-[#D81B5D] hover:bg-[#C01850] text-white text-sm font-semibold py-2.5 px-6 h-auto rounded-[12px] font-['Poppins'] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isExternalJob ? (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Apply Now
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Easy Apply
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* About the Role */}
              {job.description && (
                <section ref={detailsRef} className="bg-white border border-[#E5E5E5] rounded-[16px] p-6">
                  <h2 className="text-xl font-semibold text-[#121212] font-['Poppins'] mb-4">About the Role</h2>
                  <p className="text-base text-[#121212] leading-relaxed font-['Inter'] whitespace-pre-wrap">
                    {job.description}
                  </p>
                </section>
              )}

              {/* Requirements */}
              {job.requirements && (
                <section ref={requirementsRef} className="bg-white border border-[#E5E5E5] rounded-[16px] p-6">
                  <h2 className="text-xl font-semibold text-[#121212] font-['Poppins'] mb-4">Requirements</h2>
                  <ul className="space-y-2.5" role="list">
                    {job.requirements.split('\n').filter(line => line.trim()).map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-[#D81B5D] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-[#121212] font-['Inter'] leading-relaxed flex-1">{req.trim()}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Responsibilities */}
              {job.responsibilities && (
                <section ref={responsibilitiesRef} className="bg-white border border-[#E5E5E5] rounded-[16px] p-6">
                  <h2 className="text-xl font-semibold text-[#121212] font-['Poppins'] mb-4">Responsibilities</h2>
                  <ul className="space-y-2.5" role="list">
                    {job.responsibilities.split('\n').filter(line => line.trim()).map((resp, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-[#D81B5D] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-[#121212] font-['Inter'] leading-relaxed flex-1">{resp.trim()}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Job Flyer - Mobile/Tablet */}
              {job.flyerUrl && (
                <section className="lg:hidden bg-white border border-[#E5E5E5] rounded-[16px] p-6">
                  <h2 className="text-xl font-semibold text-[#121212] font-['Poppins'] mb-4">Job Flyer</h2>
                  <div 
                    className="relative group cursor-pointer rounded-[12px] overflow-hidden" 
                    onClick={() => window.open(job.flyerUrl, '_blank', 'noopener,noreferrer')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.open(job.flyerUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    aria-label="View full-size job flyer in new tab"
                  >
                    <img 
                      src={job.flyerUrl} 
                      alt="Job posting flyer with additional details"
                      className="w-full h-auto rounded-[12px] transition-all duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[12px] flex items-end justify-center pb-4">
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-[#D81B5D]" />
                        <span className="text-xs font-medium text-[#121212] font-['Inter']">View Full Size</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Bottom CTA */}
              <div className="lg:hidden">
                <Button
                  onClick={handleApply}
                  className="w-full bg-[#D81B5D] hover:bg-[#C01850] text-white text-sm font-semibold py-2.5 h-auto rounded-[12px] font-['Poppins'] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  {isExternalJob ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Apply Now
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Easy Apply
                    </>
                  )}
                </Button>
              </div>

            </main>

          </div>

        </div>
      </div>
    </div>
  );
}
