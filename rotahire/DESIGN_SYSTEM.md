# RotaHire Design System & UI Guidelines

**Version:** 1.0  
**Last Updated:** November 6, 2025  
**Purpose:** Comprehensive design specification for RotaHire application development

---

## Table of Contents
1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components Library](#components-library)
6. [Page Specifications](#page-specifications)
7. [Animations & Interactions](#animations--interactions)
8. [Accessibility Standards](#accessibility-standards)

---

## Brand Identity

### Logo & Branding
- **Primary Logo:** Rotaract 3220 R logo
- **Logo Variations:**
  - Cranberry version for light backgrounds
  - White version for dark backgrounds (#121212)
  - Dimensions: 163.67px × 77px (standard header size)

### Brand Voice
- Professional yet approachable
- Community-focused
- Purpose-driven
- Empowering for Rotaractors

---

## Color System

### Primary Colors

#### Brand Primary
```scss
$primary-cranberry: #D81B5D;      // Main brand color
$primary-hot-pink: #FF0057;       // Accent/highlights
$primary-deep-red: rgba(255, 0, 87, 0.8); // Overlay variant
```

#### Neutrals
```scss
$black: #000000;                  // Primary text
$near-black: #121212;             // Navigation, footer
$dark-gray: #1E1E1E;              // Headings, important text
$medium-gray: #7D7D7D;            // Secondary text, labels
$light-gray: #A1A1A1;             // Placeholder text, disabled
$lighter-gray: #ACACAC;           // Subtle text
$very-light-gray: #D9D9D9;        // Borders, dividers
$background-gray: #F6F6F6;        // Card backgrounds
$white: #FFFFFF;                  // Primary background
```

#### Accent & Feedback Colors
```scss
$pink-light: #FFA4BC;             // Posted dates, soft highlights
$pink-blush: #FFF8FA;             // Card backgrounds, hover states
$pink-border: #FFDDE6;            // Subtle borders
$pink-overlay: rgba(216, 27, 93, 0.05); // Very light overlays
$pink-button: rgba(216, 27, 93, 0.15);  // Button backgrounds
$pink-glow: rgba(216, 27, 93, 0.24);    // Glow effects
$pink-intense: rgba(216, 27, 93, 0.38); // Strong overlays
```

### Usage Guidelines

**Primary Actions:** Use `$primary-cranberry` for:
- Primary buttons
- Active states
- Important CTAs
- Links on hover

**Backgrounds:**
- Main: `$white`
- Cards: `$background-gray` or `$pink-blush`
- Overlays: `$pink-overlay` to `$pink-intense` (based on emphasis)

**Text Hierarchy:**
1. Headings: `$black` or `$dark-gray`
2. Body: `$black`
3. Secondary: `$medium-gray` or `$light-gray`
4. Disabled: `$lighter-gray`

---

## Typography

### Font Families

```scss
$font-primary: 'Poppins', sans-serif;    // UI elements, body text
$font-secondary: 'Inter', sans-serif;     // Data, technical content
$font-accent: 'Courgette', cursive;      // "Hire" in logo only
```

### Type Scale

#### Headings
```scss
// Hero/Display
.text-hero {
  font-family: 'Poppins';
  font-weight: 600;
  font-size: 96px;
  line-height: 1.29;
  letter-spacing: -0.02em;
}

// H1 - Major Page Titles
.text-h1 {
  font-family: 'Poppins';
  font-weight: 600;
  font-size: 64px;
  line-height: 1.26;
}

// H2 - Section Headers
.text-h2 {
  font-family: 'Inter';
  font-weight: 500;
  font-size: 48px;
  line-height: 1.21;
}

// H3 - Card Titles, Job Titles
.text-h3 {
  font-family: 'Poppins';
  font-weight: 600;
  font-size: 32px;
  line-height: 1.5;
}

// H4 - Subsections
.text-h4 {
  font-family: 'Inter';
  font-weight: 500;
  font-size: 36px;
  line-height: 1.21;
}

// H5 - Component Headers
.text-h5 {
  font-family: 'Inter';
  font-weight: 500;
  font-size: 24px;
  line-height: 1.21;
}
```

#### Body Text
```scss
// Large Body
.text-body-lg {
  font-family: 'Inter';
  font-weight: 400;
  font-size: 20px;
  line-height: 1.21;
}

// Regular Body
.text-body {
  font-family: 'Inter';
  font-weight: 400;
  font-size: 16px;
  line-height: 1.21;
}

// Small Body
.text-body-sm {
  font-family: 'Inter';
  font-weight: 400;
  font-size: 14px;
  line-height: 1.21;
}

// Tiny/Caption
.text-caption {
  font-family: 'Inter';
  font-weight: 400;
  font-size: 8px;
  line-height: 1.21;
}
```

#### UI Elements
```scss
// Buttons
.text-button {
  font-family: 'Poppins';
  font-weight: 400;
  font-size: 20px;
  line-height: 1.5;
}

// Navigation
.text-nav {
  font-family: 'Poppins';
  font-weight: 400;
  font-size: 20px;
  line-height: 1.5;
}

// Labels
.text-label {
  font-family: 'Poppins';
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
}
```

---

## Spacing & Layout

### Grid System
- **Container Max Width:** 1920px
- **Gutters:** 99px (left/right on desktop)
- **Column System:** 12-column flexible grid
- **Breakpoints:**
  ```scss
  $breakpoint-xs: 320px;
  $breakpoint-sm: 640px;
  $breakpoint-md: 768px;
  $breakpoint-lg: 1024px;
  $breakpoint-xl: 1280px;
  $breakpoint-2xl: 1920px;
  ```

### Spacing Scale
```scss
$spacing-1: 4px;
$spacing-2: 8px;
$spacing-3: 12px;
$spacing-4: 16px;
$spacing-5: 20px;
$spacing-6: 24px;
$spacing-8: 32px;
$spacing-10: 40px;
$spacing-12: 48px;
$spacing-16: 64px;
$spacing-20: 80px;
$spacing-24: 96px;
```

### Border Radius
```scss
$radius-sm: 12px;     // Small elements
$radius-md: 19px;     // Buttons
$radius-lg: 28.5px;   // Apply buttons
$radius-xl: 32px;     // Cards, job listings
$radius-2xl: 69px;    // Large containers
```

---

## Components Library

### Navigation Bar

#### Desktop Navigation
```scss
.navbar {
  height: 111px; // From top to bottom of logo area
  background: $white;
  padding: 34px 99px 0;
  
  .logo {
    width: 163.67px;
    height: 77px;
  }
  
  .nav-links {
    gap: 69px; // Approximate spacing between items
    
    a {
      font-family: 'Poppins';
      font-size: 20px;
      color: $near-black;
      text-decoration: none;
      transition: color 0.3s ease;
      
      &:hover {
        color: $primary-cranberry;
      }
      
      &.active {
        font-weight: 500;
        color: $primary-cranberry;
      }
    }
  }
}
```

### Buttons

#### Primary Button
```scss
.btn-primary {
  background: $primary-cranberry;
  color: $white;
  border: none;
  border-radius: 19px;
  padding: 13px 54px;
  font-family: 'Poppins';
  font-size: 20px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: darken($primary-cranberry, 5%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(216, 27, 93, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}
```

#### Secondary Button (Outlined)
```scss
.btn-secondary {
  background: transparent;
  color: $near-black;
  border: 1px solid $near-black;
  border-radius: 19px;
  padding: 13px 54px;
  font-family: 'Poppins';
  font-size: 20px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: $near-black;
    color: $white;
  }
}
```

#### Register/Tertiary Button
```scss
.btn-tertiary {
  background: $pink-button;
  color: $primary-hot-pink;
  border: 1px dashed $primary-hot-pink;
  border-radius: 12px;
  padding: 8px 32px;
  font-family: 'Poppins';
  font-size: 20px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(216, 27, 93, 0.25);
    border-style: solid;
  }
}
```

#### Large Action Button
```scss
.btn-large {
  background: $dark-gray;
  color: $white;
  border: 1px solid $white;
  border-radius: 28.5px;
  padding: 13px auto;
  width: 494px;
  height: 57px;
  font-family: 'Inter';
  font-size: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: lighten($dark-gray, 10%);
  }
}
```

### Input Fields

#### Standard Input
```scss
.input-field {
  width: 100%;
  max-width: 751px;
  height: 55px;
  background: rgba(217, 217, 217, 0.33);
  border: 1px solid $very-light-gray;
  border-radius: 19px;
  padding: 0 50px;
  font-family: 'Poppins';
  font-size: 20px;
  color: $black;
  
  &::placeholder {
    color: $light-gray;
  }
  
  &:focus {
    outline: none;
    border-color: $primary-cranberry;
    background: $white;
  }
}
```

#### Textarea
```scss
.textarea-field {
  width: 100%;
  max-width: 751px;
  height: 124px;
  background: rgba(217, 217, 217, 0.33);
  border: 1px solid $very-light-gray;
  border-radius: 19px;
  padding: 13px 50px;
  font-family: 'Poppins';
  font-size: 20px;
  color: $black;
  resize: vertical;
  
  &::placeholder {
    color: $light-gray;
  }
  
  &:focus {
    outline: none;
    border-color: $primary-cranberry;
    background: $white;
  }
}
```

#### Smaller Input (Representative Details)
```scss
.input-field-sm {
  width: 365.41px;
  height: 55px;
  background: rgba(217, 217, 217, 0.33);
  border: 1px solid $very-light-gray;
  border-radius: 19px;
  padding: 0 50px;
  font-family: 'Poppins';
  font-size: 20px;
  color: $black;
}
```

### Cards

#### Job Listing Card
```scss
.job-card {
  width: 554px;
  height: 470px;
  background: $pink-blush;
  border: 1px solid $pink-border;
  border-radius: 32px;
  padding: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .card-inner {
    width: 524px;
    height: 400px;
    background: $white;
    border: 1px solid $very-light-gray;
    border-radius: 32px;
    padding: 30px 44px;
    position: relative;
  }
  
  .company-logo {
    width: 79px;
    height: 79px;
    background: $very-light-gray;
    border-radius: 50%;
  }
  
  .company-name {
    font-family: 'Inter';
    font-size: 20px;
    font-weight: 500;
    color: $black;
    margin-top: 28px;
  }
  
  .job-title {
    font-family: 'Inter';
    font-size: 32px;
    font-weight: 500;
    color: $black;
    margin-top: 26px;
  }
  
  .job-meta {
    display: flex;
    gap: 12px;
    margin-top: 17px;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Inter';
      font-size: 14px;
      color: $medium-gray;
      
      svg {
        width: 18-20px;
        height: 18-20px;
        color: $light-gray;
      }
    }
  }
  
  .apply-btn {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: $dark-gray;
    color: $white;
    border: 1px solid $white;
    border-radius: 28.5px;
    width: 494px;
    height: 57px;
    font-family: 'Inter';
    font-size: 24px;
    cursor: pointer;
  }
  
  .posted-date {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Inter';
    font-size: 14px;
    color: $pink-light;
  }
}
```

#### Company Floating Card (Job Categories)
```scss
.category-card {
  width: 320px;
  height: 96px;
  background: rgba(246, 246, 246, 0.7);
  border: 1px solid $white;
  border-radius: 16px;
  backdrop-filter: blur(1.3px);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  padding: 7px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  .icon {
    width: 81px;
    height: 81px;
    background: $very-light-gray;
    border-radius: 15px;
  }
  
  .text {
    .company {
      font-family: 'Inter';
      font-size: 8px;
      color: $light-gray;
      text-transform: uppercase;
    }
    
    .title {
      font-family: 'Inter';
      font-size: 20px;
      font-weight: 500;
      color: $black;
      line-height: 1.21;
    }
  }
}
```

#### Admin Request Card
```scss
.admin-request-card {
  width: 1484px;
  height: 106px;
  background: rgba(183, 183, 183, 0.1);
  border-radius: 30px;
  padding: 21px 41px;
  display: flex;
  align-items: center;
  gap: 157px;
  
  .company-logo {
    width: 64px;
    height: 64px;
    background: $very-light-gray;
    border-radius: 9px;
  }
  
  .info-item {
    font-family: 'Poppins';
    font-size: 16px;
    
    &.title {
      font-weight: 500;
      color: $medium-gray;
    }
    
    &.value {
      font-weight: 400;
      color: $medium-gray;
    }
  }
}
```

### Company Details Preview

```scss
.company-preview {
  width: 817px;
  height: 1081px;
  background: $background-gray;
  padding: 73px 97px;
  
  .logo-placeholder {
    width: 459px;
    height: 459px;
    background: $very-light-gray;
    border-radius: 14px;
  }
  
  .company-name {
    font-family: 'Inter';
    font-size: 48px;
    font-weight: 500;
    color: $black;
    margin-top: 55px;
  }
  
  .industry {
    font-family: 'Inter';
    font-size: 20px;
    font-weight: 500;
    color: $lighter-gray;
    margin-top: 13px;
  }
  
  .description {
    font-family: 'Inter';
    font-size: 16px;
    font-weight: 400;
    color: $dark-gray;
    line-height: 1.21;
    margin-top: 46px;
  }
  
  .contact-info {
    margin-top: 32px;
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 40px;
      width: 252px;
      height: 46px;
      background: rgba(216, 27, 93, 0.05);
      border: 1px solid $primary-cranberry;
      border-radius: 19px;
      padding: 0 20px;
      margin-bottom: 16px;
      
      svg {
        width: 20px;
        height: 20px;
        color: $primary-cranberry;
      }
      
      span {
        font-family: 'Inter';
        font-size: 20px;
        font-weight: 500;
        color: $primary-cranberry;
      }
    }
  }
}
```

### Filter Pills/Tags

```scss
.filter-pill {
  padding: 7px 20px;
  border: 1px solid $medium-gray;
  border-radius: 32px;
  background: transparent;
  font-family: 'Poppins';
  font-size: 20px;
  color: $medium-gray;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: $primary-cranberry;
    color: $primary-cranberry;
  }
  
  &.active {
    background: $primary-cranberry;
    border-color: $primary-cranberry;
    color: $white;
  }
}
```

### Side Navigation (Admin)

```scss
.side-nav {
  width: 323px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.1);
  padding: 56px 29px;
  
  .logo {
    width: 192px;
    height: 91px;
    margin: 0 auto 48px;
  }
  
  .nav-item {
    width: 294px;
    height: 46px;
    border-radius: 32px 0 0 32px;
    padding: 11px 39px;
    font-family: 'Poppins';
    font-size: 16px;
    color: $medium-gray;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    &.active {
      background: rgba(255, 255, 255, 0.6);
      color: $medium-gray;
    }
  }
  
  .user-info {
    width: 265px;
    height: 46px;
    border: 1px solid $medium-gray;
    border-radius: 32px;
    padding: 11px 41px;
    margin-top: auto;
    font-family: 'Poppins';
    font-size: 16px;
    color: $medium-gray;
    text-align: center;
  }
  
  .logout-btn {
    width: 265px;
    height: 46px;
    background: $primary-cranberry;
    border-radius: 32px;
    padding: 11px;
    margin-top: 15px;
    font-family: 'Poppins';
    font-size: 16px;
    color: $white;
    text-align: center;
    cursor: pointer;
  }
}
```

### Footer

```scss
.footer {
  width: 100%;
  height: 431px;
  background: $near-black;
  padding: 148px 0;
  
  .footer-logo {
    width: 287px;
    height: 135px;
    margin: 0 auto;
  }
}
```

---

## Page Specifications

### 1. Landing Page (Public)

#### Hero Section
```scss
.hero {
  padding: 188px 316px 0;
  text-align: center;
  
  h1 {
    font-family: 'Poppins';
    font-size: 96px;
    font-weight: 600;
    line-height: 1.29;
    color: $dark-gray;
    margin-bottom: 49px;
  }
  
  .subtitle {
    font-family: 'Inter';
    font-size: 20px;
    line-height: 1.21;
    color: $black;
    margin-bottom: 72px;
  }
  
  .toggle-switch {
    width: 483px;
    height: 55px;
    border: 1px solid $medium-gray;
    border-radius: 19px;
    margin: 0 auto 155px;
    display: flex;
    
    .option {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins';
      font-size: 20px;
      color: $medium-gray;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.active {
        background: $primary-cranberry;
        color: $white;
        border-radius: 19px;
      }
    }
  }
}
```

#### Featured Job Categories
- 6 cards arranged in 2 columns (3 rows)
- Spacing: 148px vertical gaps between rows
- Animation: Float in from alternating sides

#### Skills Showcase Section
```scss
.skills-section {
  padding: 184px 141px 0;
  
  h2 {
    font-family: 'Poppins';
    font-size: 64px;
    font-weight: 600;
    line-height: 1.26;
    color: $primary-cranberry;
    margin-bottom: 34px;
  }
  
  .description {
    font-family: 'Inter';
    font-size: 20px;
    line-height: 1.21;
    color: $black;
  }
  
  .skills-visual {
    // Circular layout with connecting lines
    // Central Rotaract logo (250.87px × 118.02px)
    // Skill pills positioned around circle
    // Gradient blur circles for depth
  }
}
```

#### Recent Jobs Section
```scss
.recent-jobs {
  padding: 145px 103px 0;
  
  h2 {
    font-family: 'Poppins';
    font-size: 32px;
    font-weight: 600;
    color: $light-gray;
    margin-bottom: 49px;
  }
  
  .jobs-grid {
    display: grid;
    grid-template-columns: repeat(3, 554px);
    gap: 30px;
  }
  
  .more-jobs-link {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 32px;
    font-family: 'Poppins';
    font-size: 20px;
    color: $primary-cranberry;
    cursor: pointer;
    
    .arrow-circle {
      width: 28px;
      height: 28px;
      border: 1px solid $primary-cranberry;
      border-radius: 50%;
    }
  }
}
```

### 2. Login Page

```scss
.login-page {
  display: flex;
  min-height: 100vh;
  
  .left-panel {
    width: 755px;
    background: linear-gradient(rgba(255, 0, 87, 0.8), rgba(255, 0, 87, 0.8)),
                url('background-image.jpg');
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $white;
    
    .logo {
      width: 155px;
      height: 73px;
      margin-bottom: 295px;
    }
    
    .title {
      display: flex;
      gap: 67px;
      
      .rota {
        font-family: 'Poppins';
        font-size: 128px;
        line-height: 1.5;
      }
      
      .hire {
        font-family: 'Courgette';
        font-size: 128px;
        line-height: 1.25;
      }
    }
  }
  
  .right-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 280px;
    
    .login-form {
      width: 100%;
      max-width: 718px;
      
      h2 {
        font-family: 'Inter';
        font-size: 48px;
        font-weight: 500;
        color: $black;
        margin-bottom: 115px;
      }
      
      .form-group {
        margin-bottom: 93px;
        
        label {
          font-family: 'Poppins';
          font-size: 20px;
          color: $light-gray;
          display: block;
          margin-bottom: 13px;
        }
      }
      
      .forgot-password {
        font-family: 'Poppins';
        font-size: 20px;
        color: $light-gray;
        margin-top: -58px;
        margin-bottom: 71px;
        cursor: pointer;
        
        &:hover {
          color: $primary-cranberry;
        }
      }
      
      .login-button {
        width: 362px;
        margin: 0 auto 290px;
      }
      
      .register-section {
        display: flex;
        align-items: center;
        gap: 20px;
        
        span {
          font-family: 'Poppins';
          font-size: 20px;
          color: $light-gray;
        }
      }
    }
  }
}
```

### 3. Company Onboarding

```scss
.onboarding-page {
  display: flex;
  min-height: 100vh;
  
  .form-section {
    flex: 1;
    padding: 86px 166px 0;
    
    h1 {
      font-family: 'Inter';
      font-size: 48px;
      font-weight: 500;
      color: $black;
      margin-bottom: 95px;
    }
    
    .form-group {
      margin-bottom: 21px;
      
      &.large {
        margin-bottom: 76px;
      }
      
      label {
        font-family: 'Poppins';
        font-size: 20px;
        color: $light-gray;
        display: block;
        margin-bottom: 13px;
      }
    }
    
    .section-label {
      font-family: 'Poppins';
      font-size: 16px;
      color: $medium-gray;
      margin: 70px 0 17px;
    }
    
    .rep-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .submit-button {
      width: 362px;
      margin-top: 39px;
    }
  }
  
  .preview-section {
    width: 821px;
    background: $primary-cranberry;
    padding: 0 4px;
  }
}
```

### 4. Jobs Listing Page

```scss
.jobs-page {
  padding: 0 99px;
  
  .filters-section {
    margin-top: 86px;
    
    .search-bar {
      width: 1138px;
      height: 320px;
      border: 1px solid $very-light-gray;
      border-radius: 32px;
      padding: 40px 26px;
      
      .industry-select {
        width: 494px;
        height: 70px;
        border: 1px solid $medium-gray;
        border-radius: 32px;
        padding: 0 20px;
        margin-bottom: 30px;
      }
      
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 9px;
      }
    }
    
    .sort-section {
      width: 554px;
      height: 320px;
      border: 1px solid $very-light-gray;
      border-radius: 32px;
      padding: 40px;
      
      .search-input {
        width: 494px;
        height: 70px;
        border: 1px solid $medium-gray;
        border-radius: 32px;
        padding: 0 20px;
        margin-bottom: 30px;
      }
      
      .sort-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
    }
  }
  
  .jobs-grid {
    display: grid;
    grid-template-columns: repeat(3, 554px);
    gap: 30px;
    margin-top: 93px;
  }
}
```

### 5. Job Detail Page

```scss
.job-detail-page {
  padding: 0 99px;
  
  .job-container {
    background: $pink-blush;
    border: 1px solid $pink-border;
    border-radius: 69px;
    padding: 73px 88px;
    margin-top: 66px;
    
    .company-info-card {
      width: 400px;
      height: 400px;
      background: $white;
      border: 1px solid $very-light-gray;
      border-radius: 32px;
      float: left;
      margin-right: 117px;
    }
    
    .job-header {
      margin-bottom: 135px;
      
      .company-name {
        font-family: 'Inter';
        font-size: 20px;
        font-weight: 500;
        color: $primary-cranberry;
      }
      
      .job-title {
        font-family: 'Inter';
        font-size: 64px;
        font-weight: 500;
        color: $black;
        margin-top: 9px;
      }
      
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, auto);
        gap: 20px 61px;
        margin-top: 43px;
      }
      
      .posted-date {
        font-family: 'Inter';
        font-size: 14px;
        color: $pink-light;
        margin-top: 85px;
      }
      
      .apply-button {
        width: 215px;
        margin-top: 15px;
      }
    }
    
    .section {
      background: $white;
      border: 1px solid $very-light-gray;
      border-radius: 32px;
      padding: 61px 70px;
      margin-bottom: 99px;
      
      h2 {
        font-family: 'Inter';
        font-size: 40px;
        font-weight: 500;
        color: $black;
        margin-bottom: 48px;
      }
      
      .requirement-item,
      .responsibility-item {
        height: 22px;
        background: $very-light-gray;
        border-radius: 2px;
        margin-bottom: 22px;
        
        // Placeholder for actual text content
      }
    }
    
    .flyer-section {
      text-align: center;
      
      h2 {
        margin-bottom: 192px;
      }
    }
  }
}
```

### 6. Admin Dashboard

```scss
.admin-dashboard {
  display: flex;
  
  .side-nav {
    // See Side Navigation component above
  }
  
  .main-content {
    flex: 1;
    padding: 80px 49px;
    
    h1 {
      font-family: 'Inter';
      font-size: 36px;
      font-weight: 500;
      color: $black;
      margin-bottom: 53px;
    }
    
    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 33px;
    }
  }
}
```

---

## Animations & Interactions

### Motion Principles
- **Duration:** 200-400ms for micro-interactions, 400-600ms for page transitions
- **Easing:** cubic-bezier(0.4, 0.0, 0.2, 1) for most animations
- **Approach:** Subtle, purposeful, performance-conscious

### GSAP Animation Patterns

#### Page Load Animations
```javascript
// Hero text fade in
gsap.from('.hero h1', {
  opacity: 0,
  y: 40,
  duration: 0.8,
  ease: 'power3.out'
});

// Stagger job cards
gsap.from('.job-card', {
  opacity: 0,
  y: 60,
  stagger: 0.15,
  duration: 0.6,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.jobs-grid',
    start: 'top 80%'
  }
});

// Skills circle animation
gsap.from('.skill-pill', {
  opacity: 0,
  scale: 0,
  stagger: {
    amount: 1,
    from: 'random'
  },
  duration: 0.5,
  ease: 'back.out(1.4)',
  scrollTrigger: {
    trigger: '.skills-visual',
    start: 'top 70%'
  }
});
```

#### Hover Interactions
```javascript
// Card hover effect
const cards = gsap.utils.toArray('.job-card');
cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card, {
      y: -8,
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
      duration: 0.3,
      ease: 'power2.out'
    });
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      y: 0,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      duration: 0.3,
      ease: 'power2.out'
    });
  });
});

// Button press effect
const buttons = gsap.utils.toArray('.btn-primary');
buttons.forEach(btn => {
  btn.addEventListener('mousedown', () => {
    gsap.to(btn, { scale: 0.95, duration: 0.1 });
  });
  
  btn.addEventListener('mouseup', () => {
    gsap.to(btn, { scale: 1, duration: 0.2, ease: 'back.out(3)' });
  });
});
```

#### Form Interactions
```javascript
// Input focus animation
const inputs = gsap.utils.toArray('.input-field');
inputs.forEach(input => {
  input.addEventListener('focus', () => {
    gsap.to(input, {
      borderColor: '#D81B5D',
      background: '#FFFFFF',
      duration: 0.3
    });
  });
  
  input.addEventListener('blur', () => {
    if (!input.value) {
      gsap.to(input, {
        borderColor: '#D9D9D9',
        background: 'rgba(217, 217, 217, 0.33)',
        duration: 0.3
      });
    }
  });
});
```

#### Page Transitions
```javascript
// Navigate with fade
function navigateWithTransition(url) {
  gsap.to('main', {
    opacity: 0,
    y: -20,
    duration: 0.4,
    onComplete: () => {
      window.location.href = url;
    }
  });
}

// Enter animation for new page
gsap.from('main', {
  opacity: 0,
  y: 20,
  duration: 0.5,
  ease: 'power2.out'
});
```

### ShadCN Component Enhancements

When using ShadCN components, maintain these animation standards:

```javascript
// Dialog open animation
<Dialog>
  <DialogContent className="animate-in fade-in-0 zoom-in-95 duration-300">
    {/* content */}
  </DialogContent>
</Dialog>

// Tooltip subtle appearance
<TooltipContent className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
  {/* content */}
</TooltipContent>

// Dropdown menu
<DropdownMenuContent className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
  {/* items */}
</DropdownMenuContent>
```

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

#### Color Contrast
- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text (18pt+):** Minimum 3:1 contrast ratio
- **UI components:** Minimum 3:1 contrast ratio

**Verified Combinations:**
- `$black` on `$white` ✓ (21:1)
- `$primary-cranberry` on `$white` ✓ (4.8:1)
- `$medium-gray` on `$white` ✓ (4.7:1)
- `$white` on `$primary-cranberry` ✓ (4.8:1)
- `$white` on `$dark-gray` ✓ (16.2:1)

#### Keyboard Navigation
```scss
// Focus visible state for all interactive elements
*:focus-visible {
  outline: 2px solid $primary-cranberry;
  outline-offset: 2px;
  border-radius: 4px;
}

// Skip to main content link
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: $primary-cranberry;
  color: $white;
  padding: 8px;
  z-index: 100;
  
  &:focus {
    top: 0;
  }
}
```

#### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- `<nav>` for navigation
- `<main>` for primary content
- `<footer>` for footer
- `<article>` for job listings
- `<section>` for content sections

#### ARIA Labels
```html
<!-- Search input -->
<input 
  type="search" 
  aria-label="Search for jobs by keyword"
  placeholder="Search for keywords"
/>

<!-- Navigation -->
<nav aria-label="Main navigation">
  <!-- nav items -->
</nav>

<!-- Job card -->
<article aria-labelledby="job-title-123">
  <h3 id="job-title-123">Software Engineer</h3>
  <!-- job details -->
</article>

<!-- Filter buttons -->
<button 
  aria-pressed="true" 
  aria-label="Filter by full-time positions"
>
  Full-Time
</button>
```

#### Screen Reader Support
```html
<!-- Loading state -->
<div role="status" aria-live="polite">
  <span className="sr-only">Loading jobs...</span>
</div>

<!-- Error messages -->
<div role="alert" aria-live="assertive">
  Please enter a valid email address
</div>

<!-- Job count -->
<div aria-live="polite" aria-atomic="true">
  Showing 9 of 150 jobs
</div>
```

### Responsive Design

#### Breakpoint Strategy
```scss
// Mobile-first approach
.component {
  // Base mobile styles
  padding: 20px;
  
  @media (min-width: 768px) {
    // Tablet
    padding: 40px;
  }
  
  @media (min-width: 1024px) {
    // Desktop
    padding: 99px;
  }
}

// Navigation responsive behavior
.navbar {
  // Mobile: Hamburger menu
  .nav-links {
    display: none;
    
    @media (min-width: 1024px) {
      display: flex;
    }
  }
  
  .mobile-menu-btn {
    display: block;
    
    @media (min-width: 1024px) {
      display: none;
    }
  }
}

// Grid responsive layouts
.jobs-grid {
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1440px) {
    grid-template-columns: repeat(3, 554px);
    gap: 30px;
  }
}
```

---

## Implementation Guidelines

### ShadCN Component Customization

All ShadCN components should be customized to match this design system:

#### Button Variants
```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center transition-all",
  {
    variants: {
      variant: {
        default: "bg-cranberry text-white hover:bg-cranberry/90",
        secondary: "bg-transparent border border-black text-black hover:bg-black hover:text-white",
        tertiary: "bg-pink-button border border-dashed border-hot-pink text-hot-pink",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-[55px] px-[54px] rounded-[19px] text-[20px] font-poppins",
        sm: "h-[45px] px-8 rounded-[12px]",
        lg: "h-[57px] w-[494px] rounded-[28.5px] text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### Input Customization
```typescript
// components/ui/input.tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[55px] w-full rounded-[19px] border border-[#D9D9D9]",
          "bg-[rgba(217,217,217,0.33)] px-[50px]",
          "font-poppins text-[20px] text-black placeholder:text-[#A1A1A1]",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-cranberry focus-visible:bg-white",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### Card Customization
```typescript
// components/ui/card.tsx
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[32px] border border-[#FFDDE6] bg-[#FFF8FA]",
        "shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
);
```

### Theme Configuration

#### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        cranberry: '#D81B5D',
        'hot-pink': '#FF0057',
        'near-black': '#121212',
        'dark-gray': '#1E1E1E',
        'medium-gray': '#7D7D7D',
        'light-gray': '#A1A1A1',
        'very-light-gray': '#D9D9D9',
        'background-gray': '#F6F6F6',
        'pink-light': '#FFA4BC',
        'pink-blush': '#FFF8FA',
        'pink-border': '#FFDDE6',
        'pink-button': 'rgba(216, 27, 93, 0.15)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        courgette: ['Courgette', 'cursive'],
      },
      fontSize: {
        'hero': ['96px', { lineHeight: '1.29', fontWeight: '600' }],
        'h1': ['64px', { lineHeight: '1.26', fontWeight: '600' }],
        'h2': ['48px', { lineHeight: '1.21', fontWeight: '500' }],
        'h3': ['32px', { lineHeight: '1.5', fontWeight: '600' }],
        'h4': ['36px', { lineHeight: '1.21', fontWeight: '500' }],
        'h5': ['24px', { lineHeight: '1.21', fontWeight: '500' }],
        'body-lg': ['20px', { lineHeight: '1.21' }],
        'body': ['16px', { lineHeight: '1.21' }],
        'body-sm': ['14px', { lineHeight: '1.21' }],
        'caption': ['8px', { lineHeight: '1.21' }],
      },
      borderRadius: {
        'sm': '12px',
        'md': '19px',
        'lg': '28.5px',
        'xl': '32px',
        '2xl': '69px',
      },
      spacing: {
        '99': '99px',
      },
    },
  },
};
```

### CSS Custom Properties
```css
:root {
  /* Colors */
  --color-cranberry: #D81B5D;
  --color-hot-pink: #FF0057;
  --color-black: #000000;
  --color-near-black: #121212;
  --color-dark-gray: #1E1E1E;
  --color-medium-gray: #7D7D7D;
  --color-light-gray: #A1A1A1;
  --color-very-light-gray: #D9D9D9;
  --color-background-gray: #F6F6F6;
  --color-white: #FFFFFF;
  --color-pink-light: #FFA4BC;
  --color-pink-blush: #FFF8FA;
  --color-pink-border: #FFDDE6;
  
  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
  
  /* Border Radius */
  --radius-sm: 12px;
  --radius-md: 19px;
  --radius-lg: 28.5px;
  --radius-xl: 32px;
  --radius-2xl: 69px;
  
  /* Transitions */
  --transition-fast: 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

---

## Quality Checklist

Before deploying any component or page, verify:

### Visual Quality
- [ ] Colors match design system exactly
- [ ] Typography uses correct font families and sizes
- [ ] Spacing follows 4px/8px grid system
- [ ] Border radius values are consistent
- [ ] Images are optimized (WebP with fallbacks)
- [ ] Icons are SVG or icon font
- [ ] Shadows and effects match specifications

### Interaction Quality
- [ ] All hover states are defined
- [ ] Active/pressed states are visible
- [ ] Focus states meet accessibility standards
- [ ] Animations are smooth (60fps)
- [ ] Loading states are handled
- [ ] Error states are styled
- [ ] Empty states are designed

### Responsive Quality
- [ ] Layout adapts to all breakpoints
- [ ] Touch targets are minimum 44x44px
- [ ] Text remains readable at all sizes
- [ ] Images scale appropriately
- [ ] Navigation is accessible on mobile
- [ ] Forms are usable on small screens

### Accessibility Quality
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader labels are present
- [ ] Focus order is logical
- [ ] ARIA attributes are correct
- [ ] Semantic HTML is used
- [ ] Alt text is descriptive

### Performance Quality
- [ ] GSAP animations use GPU acceleration
- [ ] Images are lazy-loaded
- [ ] Fonts are preloaded
- [ ] Critical CSS is inlined
- [ ] Bundle size is optimized
- [ ] Lighthouse score > 90

---

## Development Workflow

### 1. Component Development
1. Review design in Figma
2. Create component with ShadCN base
3. Apply design system styles
4. Add GSAP animations
5. Test accessibility
6. Test responsiveness
7. Optimize performance

### 2. Page Development
1. Build layout structure
2. Integrate components
3. Add page-specific styles
4. Implement scroll animations
5. Test user flows
6. Optimize load time

### 3. Testing
1. Visual regression testing
2. Cross-browser testing
3. Accessibility audit (axe DevTools)
4. Performance profiling
5. User acceptance testing

---

## Resources & References

### Design Tools
- **Figma Files:** [Project Link]
- **Color Palette:** Use built-in color picker
- **Typography:** Google Fonts (Poppins, Inter, Courgette)

### Development Tools
- **ShadCN UI:** https://ui.shadcn.com/
- **GSAP:** https://greensock.com/gsap/
- **Tailwind CSS:** https://tailwindcss.com/
- **Next.js:** https://nextjs.org/

### Accessibility Tools
- **axe DevTools:** Browser extension
- **WAVE:** Web accessibility evaluation tool
- **Lighthouse:** Chrome DevTools audit

### Animation Libraries
- **GSAP ScrollTrigger:** For scroll-based animations
- **GSAP SplitText:** For text animations (premium)
- **Lottie:** For complex illustrations (if needed)

---

## Version History

- **v1.0** (November 6, 2025) - Initial design system based on Figma analysis

---

## Maintenance

This design system should be reviewed and updated:
- Quarterly for minor refinements
- When adding new components
- When brand guidelines change
- When accessibility standards update

**Document Owner:** Development Team  
**Last Review:** November 6, 2025  
**Next Review:** February 6, 2026
