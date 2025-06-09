'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Calendar from '@/components/Calendar';
import UnauthorizedAccess from '@/components/UnauthorizedAccess';

export default function Home() {
  const { user, loading, isAuthorized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user is authorized to access the system
  if (!isAuthorized) {
    return <UnauthorizedAccess />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Calendar />
    </main>
  );
}
