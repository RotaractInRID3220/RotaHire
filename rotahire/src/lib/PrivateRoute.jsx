"use client";
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const PrivateRoute = ({
  children,
  accessType,              // 'admin' or 'portal'
  allowedRoles,            // Array of role_ids that can access
  requiredPermission,      // 'admin' or 'super_admin'
  redirectTo = "/admin/login"
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push(redirectTo); // Not authenticated
      return;
    }

    // Check access type
    if (accessType === 'admin' && !session.user?.hasAdminAccess) {
      router.push('/unauthorized');
      return;
    }

    if (accessType === 'portal' && !session.user?.hasPortalAccess) {
      router.push('/unauthorized');
      return;
    }

    // Check allowed roles (if specified)
    if (allowedRoles && !allowedRoles.includes(session.user?.role_id)) {
      router.push('/unauthorized');
      return;
    }

    // Check permission level (if specified)
    if (requiredPermission) {
      const userPermission = session.user?.permission_level;
      if (requiredPermission === 'super_admin' && userPermission !== 'super_admin') {
        router.push('/unauthorized');
        return;
      }
      if (requiredPermission === 'admin' && !['admin', 'super_admin'].includes(userPermission)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [session, status, router, accessType, allowedRoles, requiredPermission, redirectTo]);

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D81B5D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or unauthorized
  if (!session) {
    return null;
  }

  // Check access type
  if (accessType === 'admin' && !session.user?.hasAdminAccess) {
    return null;
  }

  if (accessType === 'portal' && !session.user?.hasPortalAccess) {
    return null;
  }

  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(session.user?.role_id)) {
    return null;
  }

  // Check permission level
  if (requiredPermission) {
    const userPermission = session.user?.permission_level;
    if (requiredPermission === 'super_admin' && userPermission !== 'super_admin') {
      return null;
    }
    if (requiredPermission === 'admin' && !['admin', 'super_admin'].includes(userPermission)) {
      return null;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
