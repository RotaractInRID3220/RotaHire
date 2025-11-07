import PortalPrivateRoute from '@/lib/PortalPrivateRoute';

export const metadata = {
  title: 'RotaHire Portal',
  description: 'Company portal for RotaHire - Connect with talented Rotaractors',
};

export default function PortalLayout({ children }) {
  return (
    <PortalPrivateRoute>
      {children}
    </PortalPrivateRoute>
  );
}