// Layout for public portal pages (signup, verify-email)
export default function PortalPublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}