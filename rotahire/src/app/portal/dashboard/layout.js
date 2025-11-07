'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAtom } from 'jotai';
import { portalUserAtom } from '@/app/state/store';
import { checkCompanyOnboarding } from '@/services/auth/authService';
import SideNav from './components/SideNav';

const DashboardLayout = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [portalUser] = useAtom(portalUserAtom);

  // Check if current route is onboarding or just completed
  const isOnboardingPage = pathname === '/portal/dashboard/onboarding';
  const justCompletedOnboarding = searchParams.get('onboarding') === 'completed';

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!portalUser?.id) {
        setIsLoading(false);
        return;
      }

      // Skip onboarding check if already on onboarding page or just completed onboarding
      if (isOnboardingPage || justCompletedOnboarding) {
        setIsLoading(false);
        return;
      }

      try {
        const onboardingStatus = await checkCompanyOnboarding(portalUser.id);

        if (onboardingStatus.needsOnboarding) {
          // User hasn't completed onboarding, redirect to onboarding
          router.push('/portal/dashboard/onboarding');
          return;
        }

        setCompanyData(onboardingStatus.company);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If there's an error checking onboarding, don't redirect - let user proceed
        setIsLoading(false);
      }
    };

    // Add a small delay to prevent race conditions
    const timeoutId = setTimeout(checkOnboardingStatus, 100);

    return () => clearTimeout(timeoutId);
  }, [portalUser, pathname, router, isOnboardingPage, justCompletedOnboarding]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D81B5D] mx-auto mb-4"></div>
          <p className="text-gray-600 font-['Inter'] text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If on onboarding page, render without sidebar
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Side Navigation */}
      <SideNav companyData={companyData} />

      {/* Main content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;