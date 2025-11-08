'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signIn, useSession } from 'next-auth/react';
import { adminLoginSchema } from '@/schemas/authSchema';
import { useSetAtom } from 'jotai';
import { userDeetsAtom } from '@/app/state/store';
import { useEffect } from 'react';

// Admin login page with NextAuth credentials authentication
// Uses DBMID API for credential verification and Supabase for permission levels
export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const setUserDeets = useSetAtom(userDeetsAtom);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    mode: 'onChange'
  });

  // Redirect authenticated admin users to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.hasAdminAccess) {
      setUserDeets(session.user.userDeets);
      router.push('/admin/dashboard');
    }
  }, [status, session, router, setUserDeets]);

  // Handles form submission for admin authentication via NextAuth
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      // Call NextAuth signIn with admin credentials provider
      const result = await signIn('admin-credentials', {
        username: data.username,
        password: data.password,
        redirect: false
      });

      if (result?.error) {
        toast.error(result.error || 'Authentication failed');
        return;
      }

      if (result?.ok) {
        toast.success('Welcome Admin!');
        // Session will be set and useEffect will handle redirect
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Right Panel - Login Form (flipped from portal) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md" style={{gap: '32px', display: 'flex', flexDirection: 'column'}}>
          {/* Header */}
          <div className="text-center" style={{gap: '16px', display: 'flex', flexDirection: 'column'}}>
            <h1 className="font-bold text-black font-['Poppins']" style={{fontSize: '32px', lineHeight: '1.5'}}>
              Admin Access
            </h1>
            <p className="text-black font-['Inter'] font-normal leading-relaxed" style={{fontSize: '16px'}}>
              Sign in to your admin account to manage Rotaract operations
            </p>
          </div>

          {/* Admin Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{gap: '20px', display: 'flex', flexDirection: 'column'}}>
            {/* Username Field */}
            <div style={{gap: '8px', display: 'flex', flexDirection: 'column'}}>
              <label
                htmlFor="username"
                className="font-['Poppins'] font-normal text-black"
                style={{fontSize: '16px'}}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                {...register('username')}
                className="w-full h-12 bg-white border border-gray-300 font-['Inter'] font-normal text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:border-[#D81B5D] transition-all"
                style={{
                  borderRadius: '12px',
                  fontSize: '16px',
                  padding: '12px 16px'
                }}
                placeholder="Enter your username"
                aria-describedby={errors.username ? "username-error" : undefined}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p
                  id="username-error"
                  className="font-['Inter'] font-normal text-red-600"
                  style={{fontSize: '14px'}}
                  role="alert"
                >
                  {errors.username.message}
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full bg-[#D81B5D] hover:bg-[#B0174A] disabled:bg-[#D81B5D]/60 text-white font-['Poppins'] font-normal transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D81B5D] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm hover:shadow-md"
              style={{
                height: '57px',
                borderRadius: '19px',
                fontSize: '20px',
                lineHeight: '1.5',
                padding: '13px 54px'
              }}
              aria-label="Sign in to admin account"
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
          </form>

          {/* Additional Links */}
          <div className="text-center" style={{gap: '12px', display: 'flex', flexDirection: 'column'}}>
            <a
              href="/admin/forgot-password"
              className="font-['Inter'] font-normal text-[#D81B5D] hover:text-[#B0174A] underline underline-offset-2 transition-colors"
              style={{fontSize: '14px'}}
            >
              Forgot your password?
            </a>
            <p className="text-gray-500 font-['Inter'] font-normal" style={{fontSize: '14px'}}>
              Need help?{' '}
              <a
                href="mailto:admin@rotahire.com"
                className="text-[#D81B5D] hover:text-[#B0174A] font-medium underline underline-offset-2 transition-colors"
              >
                Contact admin support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Left Panel - Branding (flipped from portal) */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#D81B5D] to-[#B0174A] flex flex-col items-center justify-center text-white relative overflow-hidden py-12 lg:py-0 order-1 lg:order-2">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full blur-lg"></div>
          <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Logo and branding text */}
        <div className="relative z-10 text-center px-8" style={{gap: '32px', display: 'flex', flexDirection: 'column'}}>
          <div className="flex items-center justify-center" style={{gap: '16px'}}>
            <span className="font-['Poppins'] text-5xl lg:text-6xl font-bold text-white">Admin</span>
            <span className="font-['Courgette'] text-5xl lg:text-6xl text-pink-200">Hub</span>
          </div>
          
          <div style={{gap: '16px', display: 'flex', flexDirection: 'column'}}>
            <p className="font-['Poppins'] text-lg lg:text-xl font-semibold text-white/95">
              Rotaract Leadership Portal
            </p>
            <p className="font-['Inter'] text-base lg:text-lg text-white/80 max-w-sm leading-relaxed mx-auto">
              Welcome back, administrator. Access your dashboard to manage Rotaract operations and drive community impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
