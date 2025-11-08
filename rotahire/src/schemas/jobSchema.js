// src/schemas/jobSchema.js
import { z } from 'zod';

// Job field enum validation
export const jobFieldEnum = z.enum([
  'software_engineering',
  'data_science',
  'design',
  'marketing',
  'sales',
  'finance',
  'human_resources',
  'operations',
  'consulting',
  'healthcare',
  'education',
  'engineering',
  'legal',
  'customer_support',
  'content_writing',
  'other'
]);

// Experience level enum validation
export const experienceLevelEnum = z.enum([
  'internship',
  'entry_level',
  'mid_level',
  'senior_level',
  'lead_level',
  'executive'
]);

// Work mode enum validation
export const jobModeEnum = z.enum(['remote', 'hybrid', 'onsite']);

// Step 1: Job Type & Basic Information
export const jobStep1Schema = z.object({
  title: z.string()
    .min(3, 'Job title must be at least 3 characters')
    .max(100, 'Job title must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s]/, 'Job title cannot start with special characters'),
  field: jobFieldEnum,
  experience_level: experienceLevelEnum,
  mode: jobModeEnum,
  country: z.string().optional(),
  city: z.string().optional()
}).refine((data) => {
  // Make location mandatory for hybrid/onsite
  if (data.mode === 'hybrid' || data.mode === 'onsite') {
    return data.country && data.city;
  }
  return true;
}, {
  message: 'Location is required for Hybrid and Onsite positions',
  path: ['country']
});

// Step 2: Job Details & Requirements
export const jobStep2Schema = z.object({
  description: z.string()
    .min(500, 'Job description must be at least 500 characters')
    .max(5000, 'Job description must not exceed 5000 characters'),
  responsibilities: z.array(z.string().min(1))
    .min(3, 'At least 3 responsibilities are required')
    .max(10, 'Maximum 10 responsibilities allowed'),
  requirements: z.array(z.string().min(1))
    .min(3, 'At least 3 requirements are required')
    .max(8, 'Maximum 8 requirements allowed'),
  skills: z.array(z.string().min(1))
    .min(3, 'At least 3 skills are required'),
  min_salary: z.number().positive().optional().nullable(),
  max_salary: z.number().positive().optional().nullable(),
  currency: z.string().default('LKR'),
  is_salary_disclosed: z.boolean().default(false),
  require_github: z.boolean().default(false),
  require_linkedin: z.boolean().default(false),
  require_portfolio: z.boolean().default(false)
}).refine((data) => {
  // Validate salary range if both are provided
  if (data.min_salary && data.max_salary) {
    return data.max_salary >= data.min_salary;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['max_salary']
});

// Step 3: Application Settings
export const jobStep3Schema = z.object({
  application_method: z.enum(['direct', 'external']).default('direct'),
  external_application_url: z.string().url('Please enter a valid HTTPS URL').optional().nullable(),
  application_deadline: z.string().datetime().optional().nullable()
}).refine((data) => {
  // Make external URL mandatory if application method is external
  if (data.application_method === 'external') {
    return data.external_application_url && data.external_application_url.startsWith('https://');
  }
  return true;
}, {
  message: 'External application URL is required and must be HTTPS',
  path: ['external_application_url']
});

// Complete job posting schema (all steps combined)
export const completeJobSchema = z.object({
  // Step 1
  title: z.string().min(3).max(100),
  field: jobFieldEnum,
  experience_level: experienceLevelEnum,
  mode: jobModeEnum,
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  
  // Step 2
  description: z.string().min(500).max(5000),
  responsibilities: z.array(z.string()).min(3).max(10),
  requirements: z.array(z.string()).min(3).max(8),
  skills: z.array(z.string()).min(3),
  min_salary: z.number().positive().optional().nullable(),
  max_salary: z.number().positive().optional().nullable(),
  currency: z.string().default('LKR'),
  is_salary_disclosed: z.boolean().default(false),
  require_github: z.boolean().default(false),
  require_linkedin: z.boolean().default(false),
  require_portfolio: z.boolean().default(false),
  
  // Step 3
  application_method: z.enum(['direct', 'external']).default('direct'),
  external_application_url: z.string().url().optional().nullable(),
  application_deadline: z.string().datetime().optional().nullable(),
  
  // Step 4 (optional)
  job_flyer_url: z.string().url().optional().nullable(),
  company_logo_override_url: z.string().url().optional().nullable()
});
