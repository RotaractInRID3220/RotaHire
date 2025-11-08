export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div className="space-y-3">
          <a
            href="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#D81B5D] hover:bg-[#B0174A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D81B5D] transition-colors duration-200"
          >
            Go to Dashboard
          </a>

          <div className="block">
            <a
              href="/admin/login"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Sign in as different user
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
          <p className="text-xs text-gray-600">
            If you believe you should have access to this page, please contact the system administrator
            or check with your club leadership about your permission level.
          </p>
        </div>
      </div>
    </div>
  );
}