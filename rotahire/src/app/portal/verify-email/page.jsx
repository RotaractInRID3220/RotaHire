'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { resendVerificationEmail } from '@/services/auth/authService';

// Email verification page with resend functionality
export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  // Handles resending verification email
  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    try {
      setIsLoading(true);
      await resendVerificationEmail(email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  // Handles navigation back to login
  const handleBackToLogin = () => {
    router.push('/portal/login');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Branding */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#D81B5D] to-[#FF0057] flex flex-col items-center justify-center text-white relative overflow-hidden py-12 lg:py-0">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full blur-lg"></div>
        </div>

        {/* Logo and branding text */}
        <div className="relative z-10 text-center px-8" style={{gap: '24px', display: 'flex', flexDirection: 'column'}}>
          <div className="flex items-center justify-center" style={{gap: '16px'}}>
            <span className="font-['Poppins'] text-5xl lg:text-6xl font-semibold text-white">Rota</span>
            <span className="font-['Courgette'] text-5xl lg:text-6xl text-white">Hire</span>
          </div>
          <p className="font-['Inter'] text-base lg:text-lg text-white/90 max-w-sm leading-relaxed mx-auto">
            Verify your email to complete your company registration and start connecting with talent
          </p>
        </div>
      </div>

      {/* Right Panel - Verification Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md text-center" style={{gap: '32px', display: 'flex', flexDirection: 'column'}}>
          {/* Email icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-[#D81B5D]/10 rounded-full flex items-center justify-center" style={{borderRadius: '32px'}}>
              <svg
                className="w-10 h-10 text-[#D81B5D]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div style={{gap: '16px', display: 'flex', flexDirection: 'column'}}>
            <h1 className="font-bold text-black font-['Poppins']" style={{fontSize: '32px', lineHeight: '1.5'}}>
              Check Your Email
            </h1>
            <p className="text-black font-['Inter'] font-normal leading-relaxed" style={{fontSize: '16px'}}>
              We've sent a verification link to:
            </p>
            {email && (
              <div className="bg-[#D81B5D]/5 border border-[#D81B5D]/20 rounded-lg p-4 inline-block" style={{borderRadius: '12px'}}>
                <p className="font-['Poppins'] text-base font-medium text-[#D81B5D]">
                  {email}
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div style={{gap: '24px', display: 'flex', flexDirection: 'column'}}>
            <p className="text-gray-600 font-['Inter'] font-normal leading-relaxed max-w-sm mx-auto" style={{fontSize: '14px'}}>
              Click the verification link in the email to activate your account.
              If you don't see the email, check your spam folder.
            </p>

            {/* Action Buttons */}
            <div style={{gap: '16px', display: 'flex', flexDirection: 'column'}}>
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full bg-[#D81B5D] hover:bg-[#FF0057] disabled:bg-[#D81B5D]/60 text-white font-['Poppins'] font-normal transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm hover:shadow-md"
                style={{
                  height: '57px',
                  borderRadius: '19px',
                  fontSize: '20px',
                  lineHeight: '1.5',
                  padding: '13px 54px'
                }}
                aria-label="Resend verification email"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Resend Verification Email'
                )}
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full bg-white border border-black text-black hover:bg-black hover:text-white font-['Poppins'] font-normal transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm hover:shadow-md"
                style={{
                  height: '57px',
                  borderRadius: '19px',
                  fontSize: '20px',
                  lineHeight: '1.5',
                  padding: '13px 54px'
                }}
                aria-label="Go back to login page"
              >
                Back to Login
              </button>
            </div>

            {/* Additional help */}
            <div className="pt-4 border-t border-gray-200" style={{paddingTop: '16px'}}>
              <p className="text-gray-500 font-['Inter'] font-normal" style={{fontSize: '14px'}}>
                Need help?{' '}
                <a
                  href="mailto:support@rotahire.com"
                  className="text-[#D81B5D] hover:text-[#FF0057] font-medium underline underline-offset-2 transition-colors"
                >
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}