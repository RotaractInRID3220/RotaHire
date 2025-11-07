'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useAtom } from 'jotai';
import { portalUserAtom } from '@/app/state/store';
import gsap from 'gsap';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Building2, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

// Props: { companyData: { company_name, company_logo_url } }
// Premium left sidebar navigation with GSAP animations, light theme with text labels
export default function SideNav({ companyData }) {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  const mobileSidebarRef = useRef(null);
  const logoRef = useRef(null);
  const navItemsRef = useRef([]);
  const mobileNavItemsRef = useRef([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalUser] = useAtom(portalUserAtom);

  const navigation = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', href: '/portal/dashboard/jobs', icon: Briefcase },
    { name: 'Applications', href: '/portal/dashboard/applications', icon: FileText },
    { name: 'Company Profile', href: '/portal/dashboard/profile', icon: Building2 },
    { name: 'Analytics', href: '/portal/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/portal/dashboard/settings', icon: Settings },
  ];

  // Initial entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo entrance
      gsap.from(logoRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });

      // Nav items stagger entrance
      gsap.from(navItemsRef.current, {
        x: -30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2
      });
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  // Active indicator animation - REMOVED
  useEffect(() => {
    // Removed active indicator animation
  }, [pathname, navigation]);

  // Mobile menu animation
  useEffect(() => {
    if (mobileMenuOpen) {
      const ctx = gsap.context(() => {
        gsap.fromTo(mobileSidebarRef.current,
          { x: '-100%' },
          { x: 0, duration: 0.4, ease: 'power3.out' }
        );

        gsap.from(mobileNavItemsRef.current, {
          x: -30,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.1
        });
      }, mobileSidebarRef);

      return () => ctx.revert();
    } else if (mobileSidebarRef.current) {
      gsap.to(mobileSidebarRef.current, {
        x: '-100%',
        duration: 0.3,
        ease: 'power2.in'
      });
    }
  }, [mobileMenuOpen]);

  // Handles navigation with smooth transition
  const handleNavigate = (href, index) => {
    // Animate click feedback
    gsap.to(navItemsRef.current[index], {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });

    setMobileMenuOpen(false);
    setTimeout(() => router.push(href), 100);
  };

  // Handles logout with animation
  const handleLogoutClick = async () => {
    try {
      // Fade out animation before logout
      await gsap.to(sidebarRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.3,
        ease: 'power2.in'
      });

      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/portal/login');
    } catch (error) {
      toast.error('Error logging out');
      // Reset animation on error
      gsap.to(sidebarRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.3
      });
    }
  };

  // Hover animation for nav items - REMOVED
  // const handleMouseEnter = (index) => {
  //   setHoveredIndex(index);
  //   gsap.to(navItemsRef.current[index], {
  //     x: 4,
  //     duration: 0.3,
  //     ease: 'power2.out'
  //   });
  // };

  // const handleMouseLeave = (index) => {
  //   setHoveredIndex(null);
  //   gsap.to(navItemsRef.current[index], {
  //     x: 0,
  //     duration: 0.3,
  //     ease: 'power2.out'
  //   });
  // };

  const activeIndex = navigation.findIndex(item => item.href === pathname);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        
        {companyData?.company_logo_url ? (
          <img
            src={companyData.company_logo_url}
            alt={companyData.company_name}
            className="h-8 object-contain"
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-['Poppins'] text-lg font-bold text-[#D81B5D]">Rota</span>
            <span className="font-['Courgette'] text-lg text-[#D81B5D]">Hire</span>
          </div>
        )}

        <div className="w-10" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div 
        ref={mobileSidebarRef}
        className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 z-50 shadow-xl"
        style={{ transform: 'translateX(-100%)' }}
      >
        <div className="flex flex-col h-full">
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-['Poppins'] text-lg font-bold text-[#D81B5D]">Rota</span>
              <span className="font-['Courgette'] text-lg text-[#D81B5D]">Hire</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>          {/* User Info - REMOVED from here, moved to bottom */}
          {/* Active Indicator - REMOVED */}

          {/* Mobile Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <div
                  key={item.name}
                  ref={el => mobileNavItemsRef.current[index] = el}
                  onClick={() => handleNavigate(item.href, index)}
                  className={`
                    h-12 rounded-lg flex items-center gap-3 px-4 cursor-pointer
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-[#D81B5D] text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon 
                    className="w-5 h-5"
                    strokeWidth={2}
                  />
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </nav>

          {/* Mobile User Info & Logout */}
          <div className="border-t border-gray-200 p-3 space-y-3">
            {/* User Info */}
            {companyData && (
              <div className="flex items-center gap-3 px-2">
                {companyData.company_logo_url ? (
                  <img
                    src={companyData.company_logo_url}
                    alt={companyData.company_name}
                    className="w-8 h-8 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#D81B5D] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {companyData.company_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {companyData.company_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {portalUser?.email}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div
              onClick={handleLogoutClick}
              className="h-12 rounded-lg flex items-center gap-3 px-4 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-medium">Logout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div 
        ref={sidebarRef}
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col z-50"
        style={{
          boxShadow: '1px 0 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Logo Section */}
        <div 
          ref={logoRef}
          className="h-20 flex items-center px-6 border-b border-gray-200"
        >
          <div className="flex items-center gap-2">
            <span className="font-['Poppins'] text-2xl font-bold text-[#D81B5D]">Rota</span>
            <span className="font-['Courgette'] text-2xl text-[#D81B5D]">Hire</span>
          </div>
        </div>

        {/* User Info - REMOVED from here, moved to bottom */}
        {/* Active Indicator - REMOVED */}

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <div
                key={item.name}
                ref={el => navItemsRef.current[index] = el}
                onClick={() => handleNavigate(item.href, index)}
                className="relative cursor-pointer"
              >
                <div 
                  className={`
                    h-12 rounded-lg flex items-center gap-3 px-4
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-[#D81B5D] text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon 
                    className="w-5 h-5"
                    strokeWidth={2}
                  />
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          {/* User Info */}
          {companyData && (
            <div className="flex items-center gap-3 px-2">
              {companyData.company_logo_url ? (
                <img
                  src={companyData.company_logo_url}
                  alt={companyData.company_name}
                  className="w-8 h-8 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#D81B5D] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {companyData.company_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {companyData.company_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {portalUser?.email}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div
            onClick={handleLogoutClick}
            className="h-12 rounded-lg flex items-center gap-3 px-4 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-medium">Logout</span>
          </div>
        </div>
      </div>
    </>
  );
}
