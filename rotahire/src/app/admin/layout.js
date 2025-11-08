'use client';

import PrivateRoute from "@/lib/PrivateRoute";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  // Don't apply PrivateRoute to login page to avoid redirect loop
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return children;
  }

  return (
    <PrivateRoute
      accessType="admin"
    >
      {children}
    </PrivateRoute>
  );
}
