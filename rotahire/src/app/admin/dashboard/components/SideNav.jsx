'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useAtom } from 'jotai';
import { adminUserAtom } from '@/app/state/store';
import gsap from 'gsap';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  UserCheck,
  Settings,
  Shield,
  Wrench,
  CreditCard,
  Menu,
  X,
  LogOut,
  CheckCircle
} from 'lucide-react';

// Props: { adminData: { name, email, permission_level, role_id } }
// Premium left sidebar navigation with GSAP animations, light theme with text labels
export default function SideNav({ adminData }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const sidebarRef = useRef(null);
  const mobileSidebarRef = useRef(null);
  const logoRef = useRef(null);
  const navItemsRef = useRef([]);
  const mobileNavItemsRef = useRef([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser] = useAtom(adminUserAtom);

  const userPermissionLevel = session?.user?.permission_level;
  const userRoleId = session?.user?.role_id;
  const isBasicAdmin = [1, 2, 3, 4].includes(userRoleId);

  // Filter navigation items based on permissions
  const getNavigationItems = () => {
    const allItems = [
      // Basic - accessible to all admin users (roles 1-4)
      {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        permission: 'basic'
      },
      {
        name: 'Members',
        href: '/admin/dashboard/members',
        icon: Users,
        permission: 'basic'
      },
      {
        name: 'Events',
        href: '/admin/dashboard/events',
        icon: Calendar,
        permission: 'basic'
      },
      {
        name: 'Reports',
        href: '/admin/dashboard/reports',
        icon: BarChart3,
        permission: 'basic'
      },
      {
        name: 'Job Approvals',
        href: '/admin/dashboard/job-approvals',
        icon: CheckCircle,
        permission: 'basic'
      },

      // Admin level - requires permission_level: 'admin' or 'super_admin'
      {
        name: 'User Management',
        href: '/admin/dashboard/users',
        icon: UserCheck,
        permission: 'admin'
      },
      {
        name: 'Club Settings',
        href: '/admin/dashboard/settings',
        icon: Settings,
        permission: 'admin'
      },

      // Super Admin only - requires permission_level: 'super_admin'
      {
        name: 'Permissions',
        href: '/admin/dashboard/permissions',
        icon: Shield,
        permission: 'super_admin'
      },
      {
        name: 'System Admin',
        href: '/admin/dashboard/system',
        icon: Wrench,
        permission: 'super_admin'
      },
      {
        name: 'Payments',
        href: '/admin/dashboard/payments',
        icon: CreditCard,
        permission: 'super_admin'
      }
    ];

    return allItems.filter((item) => {
      // Basic admin access check
      if (item.permission === "basic" && !isBasicAdmin) {
        return false;
      }

      // Permission level checks
      if (item.permission === "super_admin" && userPermissionLevel !== 'super_admin') {
        return false;
      }

      if (item.permission === "admin" && !['admin', 'super_admin'].includes(userPermissionLevel)) {
        return false;
      }

      return true;
    });
  };

  const navigation = getNavigationItems();

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

      await signOut({ callbackUrl: '/admin/login' });
      toast.success('Logged out successfully');
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

  if (!session) return null;

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

        <div className="flex items-center gap-2">
          <span className="font-['Poppins'] text-lg font-bold text-[#D81B5D]">Rota</span>
          <span className="font-['Courgette'] text-lg text-[#D81B5D]">Hire</span>
          <span className="text-sm text-gray-500 font-medium">Admin</span>
        </div>

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
              <span className="text-sm text-gray-500 font-medium">Admin</span>
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
            {session?.user && (
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-[#D81B5D] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {(session.user.name || session.user.email || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session.user.name || 'Admin User'}
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
            <span className="text-sm text-gray-500 font-medium">Admin</span>
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
                  className={`h-12 rounded-lg flex items-center gap-3 px-4 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#D81B5D] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
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
          {session?.user && (
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-lg bg-[#D81B5D] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {(session.user.name || session.user.email || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session.user.name || 'Admin User'}
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