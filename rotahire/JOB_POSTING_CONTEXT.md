# Job Posting Context Document

## Overview
This document outlines the complete job posting functionality for RotaHire, covering the user journey from clicking "Post a Job" to admin approval. All companies have access to full features with no tier restrictions.

## User Journey Flow

### Phase 1: Access Job Posting
**Entry Point:** Company dashboard → "Post a Job" button
**Authentication:** Must be logged in as company member with posting permissions
**Navigation:** Direct access from company dashboard or jobs management section

### Phase 2: Job Creation Form
**Form Structure:** Multi-step wizard with progress indicator
**Steps:**
1. Job Type & Basic Info
2. Job Details & Requirements
3. Application Settings
4. Media & Review

---

## Form Fields Specification

### Step 1: Job Type & Basic Information

#### **Job Title** (MANDATORY)
- **Type:** Text input with character limit (3-100 chars)
- **Validation:** Required, no special characters at start/end
- **UX Enhancement:** Auto-suggestions based on industry
- **Example:** "Senior React Developer", "Marketing Manager"

#### **Job Field** (MANDATORY)
- **Type:** Dropdown with search
- **Options:** software_engineering, data_science, design, marketing, sales, finance, human_resources, operations, consulting, healthcare, education, engineering, legal, customer_support, content_writing, other
- **UX Enhancement:** Icons for each category, grouped display

#### **Experience Level** (MANDATORY)
- **Type:** Radio buttons or dropdown
- **Options:**
  - Internship (0-1 year)
  - Entry Level (0-2 years)
  - Mid Level (2-5 years)
  - Senior Level (5-8 years)
  - Lead Level (8+ years)
  - Executive (C-level)
- **UX Enhancement:** Show expected responsibilities for each level

#### **Work Mode** (MANDATORY)
- **Type:** Radio buttons
- **Options:** Remote, Hybrid, Onsite
- **UX Enhancement:** Visual icons, conditional location fields

#### **Location** (CONDITIONAL - MANDATORY for Hybrid/Onsite)
- **Type:** Location autocomplete
- **Fields:** Country (dropdown), City (text with suggestions)
- **Default:** Auto-populate from company profile
- **UX Enhancement:** Google Places API integration

### Step 2: Job Details & Requirements

#### **Job Description** (MANDATORY)
- **Type:** Rich text editor
- **Character Limit:** 500-5000 characters
- **Required Sections:** Company overview, role responsibilities, requirements
- **UX Enhancement:** Template library, formatting toolbar, word count

#### **Key Responsibilities** (MANDATORY)
- **Type:** Dynamic list (add/remove items)
- **Format:** Bullet points, 3-10 items recommended
- **Validation:** At least 3 responsibilities required
- **UX Enhancement:** Auto-suggestions based on job field

#### **Requirements** (MANDATORY)
- **Type:** Dynamic list (add/remove items)
- **Format:** Bullet points, 3-8 items recommended
- **Categories:** Technical skills, experience, education, soft skills
- **UX Enhancement:** Categorization with drag-drop, priority levels

#### **Required Skills** (MANDATORY)
- **Type:** Tag input with autocomplete
- **Validation:** At least 3 skills required
- **UX Enhancement:**
  - Predefined skill library
  - Skill categories (Technical, Soft Skills, Tools)
  - Required vs Nice-to-have toggle
  - Proficiency levels (Beginner, Intermediate, Expert)

#### **Salary Information** (OPTIONAL)
- **Type:** Range selector with currency
- **Fields:** Min salary, Max salary, Currency (LKR default)
- **UX Enhancement:**
  - Salary range slider
  - "Confidential" option
  - Market rate suggestions based on role/location
  - Currency converter

#### **Additional Requirements** (OPTIONAL)
- **Type:** Checkbox group
- **Options:**
  - Require GitHub profile
  - Require LinkedIn profile
  - Require portfolio website
- **UX Enhancement:** Smart defaults based on job field

### Step 3: Application Settings

#### **Application Method** (MANDATORY)
- **Type:** Radio button selection
- **Options:**
  1. **Direct Applications** (Default)
     - Users apply through RotaHire platform
     - Receive CVs and applications in dashboard
     - Built-in application tracking

  2. **External Application Link**
     - Redirect users to company's own application form
     - Provide external URL for applications
- **UX Enhancement:** Feature comparison table, clear value propositions

#### **External Application URL** (CONDITIONAL - MANDATORY if External Link selected)
- **Type:** URL input
- **Validation:** Valid HTTPS URL, accessible
- **UX Enhancement:** URL preview, validation feedback

#### **Application Deadline** (OPTIONAL)
- **Type:** Date picker
- **Default:** 90 days from posting
- **UX Enhancement:** Quick select options (30, 60, 90 days)

### Step 4: Media & Review

#### **Job Flyer Upload** (OPTIONAL but RECOMMENDED)
- **Type:** Image upload
- **Specifications:**
  - **Dimensions:** 1350x1080 pixels (1350 height, 1080 width)
  - **File Size:** Maximum 3MB
  - **Format:** JPG, PNG, WebP
  - **Aspect Ratio:** 5:4 (1.25:1)
- **UX Enhancement:**
  - Drag-drop upload area
  - Real-time image preview
  - Crop tool for dimension adjustment
  - Compression optimization
  - Multiple upload attempts allowed

#### **Company Logo Override** (OPTIONAL)
- **Type:** Image upload
- **Purpose:** Use different logo for this specific job posting
- **Default:** Uses company profile logo

#### **Form Review & Submission**
- **Type:** Read-only summary
- **Sections:** All entered data, flyer preview, application method preview
- **Actions:** Edit previous steps, Submit for approval

---

## Form Validation Rules

### Real-time Validation
- **Required Fields:** Highlighted with red border and error messages
- **Character Limits:** Live counters with color coding
- **URL Validation:** Format checking with accessibility tests
- **File Upload:** Size, dimension, and format validation

### Submission Validation
- **Complete Check:** All mandatory fields filled
- **Data Integrity:** Cross-field validation (salary range logic)
- **File Requirements:** Flyer meets specifications if uploaded
- **Duplicate Prevention:** Check for similar active jobs

---

## UX Enhancement Suggestions

### Progressive Disclosure
- Show advanced options only when relevant
- Conditional fields based on selections
- Step-by-step wizard with progress indicator

### Smart Defaults
- Pre-populate location from company profile
- Suggest skills based on job field
- Auto-generate job description templates

### Interactive Elements
- **Skill Tags:** Drag-drop reordering, proficiency levels
- **Rich Text Editor:** Templates, formatting, media insertion
- **Image Upload:** Preview, crop, resize tools

### Accessibility Features
- Keyboard navigation for all form elements
- Screen reader support for complex inputs
- High contrast mode support
- Clear error messages and success states

### Mobile Optimization
- Touch-friendly form controls
- Responsive layout for all screen sizes
- Optimized file upload for mobile devices

---

## Data Flow & API Integration

### Form Submission Process
1. **Client-side Validation:** All fields validated before submission
2. **File Upload:** Job flyer uploaded to Firebase Storage first
3. **Data Compilation:** Form data + file URLs compiled
4. **API Submission:** POST to `/api/jobs/create`
5. **Status Update:** Job created with `status: 'pending_approval'`

### Database Operations
- **Jobs Table:** Insert new record with status 'pending_approval'
- **Job Skills Table:** Insert related skills
- **File Storage:** Job flyer stored in Firebase with path: `job-flyers/{job_id}_{timestamp}.{ext}`

---

## Approval Workflow Brief

### Admin Review Process
1. **Notification:** Admin receives notification of new job pending approval
2. **Review Queue:** Job appears in admin dashboard with priority based on company status
3. **Review Criteria:**
   - Content quality and completeness
   - Company verification status
   - Spam/inappropriate content detection
   - Salary reasonableness for role/level
   - Application method appropriateness

### Approval Actions
- **Approve:** Status changes to 'approved' → 'active', job goes live
- **Reject:** Status changes to 'rejected', provide detailed feedback
- **Request Revision:** Return to 'draft' status with specific improvement requests

### Post-Approval
- **Email Notifications:** Company and relevant stakeholders notified
- **Analytics Tracking:** Approval metrics recorded
- **Public Visibility:** Job immediately appears in job listings if approved

### Quality Assurance
- **Automated Checks:** Basic validation (no spam keywords, valid URLs)
- **Manual Review:** Content quality, company legitimacy
- **Feedback Loop:** Companies can appeal rejections with additional information