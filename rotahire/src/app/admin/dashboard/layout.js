import SideNav from "./components/SideNav";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SideNav />

      {/* Main Content - Add left margin for desktop to account for fixed sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}