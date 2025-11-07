'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginUser } from '@/services/auth/authService';
import { loginSchema } from '@/schemas/authSchema';
import { useSetAtom } from 'jotai';
import { portalUserAtom } from '@/app/state/store';

// Login page with email and password authentication
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setPortalUser = useSetAtom(portalUserAtom);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });

  // Handles form submission for login
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const result = await loginUser(data);

      // Store user data in portal user atom
      setPortalUser(result.user);

      toast.success('Welcome back!');

      // Always redirect to dashboard - let dashboard validate company status
      router.push('/portal/dashboard');

    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handles navigation to signup page
  const handleGoToSignup = () => {
    router.push('/portal/signup');
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
            Welcome back! Sign in to manage your company's profile and opportunities
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md" style={{gap: '32px', display: 'flex', flexDirection: 'column'}}>
          {/* Header */}
          <div className="text-center" style={{gap: '16px', display: 'flex', flexDirection: 'column'}}>
            <h1 className="font-bold text-black font-['Poppins']" style={{fontSize: '32px', lineHeight: '1.5'}}>
              Welcome Back
            </h1>
            <p className="text-black font-['Inter'] font-normal leading-relaxed" style={{fontSize: '16px'}}>
              Sign in to your company account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{gap: '20px', display: 'flex', flexDirection: 'column'}}>
            {/* Email Field */}
            <div style={{gap: '8px', display: 'flex', flexDirection: 'column'}}>
              <label
                htmlFor="email"
                className="font-['Poppins'] font-normal text-black"
                style={{fontSize: '16px'}}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full h-12 bg-white border border-gray-300 font-['Inter'] font-normal text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:border-[#D81B5D] transition-all"
                style={{
                  borderRadius: '12px',
                  fontSize: '16px',
                  padding: '12px 16px'
                }}
                placeholder="Enter your email"
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="font-['Inter'] font-normal text-red-600"
                  style={{fontSize: '14px'}}
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div style={{gap: '8px', display: 'flex', flexDirection: 'column'}}>
              <label
                htmlFor="password"
                className="font-['Poppins'] font-normal text-black"
                style={{fontSize: '16px'}}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full h-12 bg-white border border-gray-300 font-['Inter'] font-normal text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:border-[#D81B5D] transition-all"
                style={{
                  borderRadius: '12px',
                  fontSize: '16px',
                  padding: '12px 16px'
                }}
                placeholder="Enter your password"
                aria-describedby={errors.password ? "password-error" : undefined}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="font-['Inter'] font-normal text-red-600"
                  style={{fontSize: '14px'}}
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{gap: '16px', display: 'flex', flexDirection: 'column'}}>
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full bg-[#D81B5D] hover:bg-[#FF0057] disabled:bg-[#D81B5D]/60 text-white font-['Poppins'] font-normal transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm hover:shadow-md"
                style={{
                  height: '57px',
                  borderRadius: '19px',
                  fontSize: '20px',
                  lineHeight: '1.5',
                  padding: '13px 54px'
                }}
                aria-label="Sign in to your account"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={handleGoToSignup}
                className="w-full bg-white border border-black text-black hover:bg-black hover:text-white font-['Poppins'] font-normal transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm hover:shadow-md"
                style={{
                  height: '57px',
                  borderRadius: '19px',
                  fontSize: '20px',
                  lineHeight: '1.5',
                  padding: '13px 54px'
                }}
                aria-label="Create a new account"
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Additional Links */}
          <div className="text-center" style={{gap: '12px', display: 'flex', flexDirection: 'column'}}>
            <a
              href="/forgot-password"
              className="font-['Inter'] font-normal text-[#D81B5D] hover:text-[#FF0057] underline underline-offset-2 transition-colors"
              style={{fontSize: '14px'}}
            >
              Forgot your password?
            </a>
            <p className="text-gray-500 font-['Inter'] font-normal" style={{fontSize: '14px'}}>
              Need help?{' '}
              <a
                href="mailto:support@rotahire.com"
                className="text-[#D81B5D] hover:text-[#FF0057] font-medium underline underline-offset-2 transition-colors"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}