'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signupSchema } from '@/schemas/authSchema';
import { signupUser } from '@/services/auth/authService';
import { useSetAtom } from 'jotai';
import { portalUserAtom } from '@/app/state/store';

// Portal signup page with email verification flow
export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setPortalUser = useSetAtom(portalUserAtom);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  });

  // Watch form fields to enable/disable button
  const watchedFields = watch(['email', 'password', 'confirmPassword']);
  const allFieldsFilled = watchedFields.every(field => field && field.trim() !== '');
  const isFormComplete = allFieldsFilled && isValid;

  // Handles form submission for user signup
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await signupUser(data);
      toast.success('Account created successfully! Please check your email to verify your account.');
      router.push('/portal/verify-email?email=' + encodeURIComponent(data.email));
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
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
        <div className="relative z-10 text-center px-6">
          <div className="flex items-center justify-center gap-8 mb-12">
            <span className="font-['Poppins'] text-5xl lg:text-6xl font-semibold">Rota</span>
            <span className="font-['Courgette'] text-5xl lg:text-6xl">Hire</span>
          </div>
          <p className="font-['Inter'] text-base lg:text-lg max-w-md leading-relaxed">
            Connect your company with talented Rotaractors and discover amazing opportunities
          </p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8 lg:mb-12">
            <h1 className="font-['Inter'] text-3xl lg:text-4xl font-medium text-black mb-3">
              Create Account
            </h1>
            <p className="font-['Inter'] text-sm lg:text-base text-gray-600">
              Create your company account and start connecting with talent
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-['Poppins'] text-base text-[#A1A1A1] font-medium"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full h-12 bg-[rgba(217,217,217,0.33)] border border-[#D9D9D9] rounded-xl px-4 font-['Poppins'] text-base text-black placeholder:text-[#A1A1A1] focus:outline-none focus:border-[#D81B5D] focus:bg-white focus:ring-2 focus:ring-[#D81B5D]/20 transition-all"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm font-['Poppins']">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block font-['Poppins'] text-base text-[#A1A1A1] font-medium"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full h-12 bg-[rgba(217,217,217,0.33)] border border-[#D9D9D9] rounded-xl px-4 font-['Poppins'] text-base text-black placeholder:text-[#A1A1A1] focus:outline-none focus:border-[#D81B5D] focus:bg-white focus:ring-2 focus:ring-[#D81B5D]/20 transition-all"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm font-['Poppins']">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block font-['Poppins'] text-base text-[#A1A1A1] font-medium"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="w-full h-12 bg-[rgba(217,217,217,0.33)] border border-[#D9D9D9] rounded-xl px-4 font-['Poppins'] text-base text-black placeholder:text-[#A1A1A1] focus:outline-none focus:border-[#D81B5D] focus:bg-white focus:ring-2 focus:ring-[#D81B5D]/20 transition-all"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm font-['Poppins']">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormComplete || isLoading}
              className="w-full h-12 bg-[#D81B5D] text-white border border-white rounded-xl font-['Poppins'] text-base font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FF0057] hover:shadow-lg transition-all disabled:hover:bg-[#D81B5D] mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="font-['Poppins'] text-base text-[#A1A1A1]">
              Already have an account?{' '}
              <a
                href="/portal/login"
                className="text-[#D81B5D] hover:text-[#FF0057] font-medium transition-colors"
              >
                Sign in
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}