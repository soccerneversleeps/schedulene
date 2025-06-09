import { useAuth } from '@/lib/hooks/useAuth';

export default function UnauthorizedAccess() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl border border-red-200 p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            Your account <strong>{user?.email}</strong> is not authorized to access the Family First Energy scheduling system.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Need Access?</h3>
          <p className="text-red-700 text-sm">
            Please contact your administrator to request access to the appointment scheduling system.
          </p>
        </div>

        <button
          onClick={signOut}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Sign Out
        </button>

        <div className="mt-6 text-xs text-gray-500">
          <p>Family First Energy</p>
          <p>Scheduling System</p>
        </div>
      </div>
    </div>
  );
} 