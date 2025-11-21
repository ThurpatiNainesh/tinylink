'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLinkByCode, incrementClick } from '@/lib/queries';

export default function Redirector({ code }: { code: string }) {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const link = await getLinkByCode(code);
        if (link) {
          try {
            // Wait for the click to be counted before redirecting
            await incrementClick(code);
            // Only redirect after the click is counted
            window.location.href = link.targetUrl;
          } catch (error) {
            console.error('Failed to increment click count:', error);
            // Still redirect even if click counting fails
            window.location.href = link.targetUrl;
          }
        } else {
          // If link not found, redirect to 404
          router.push('/404');
        }
      } catch (error) {
        console.error('Error during redirect:', error);
        router.push('/500');
      }
    };

    handleRedirect();
  }, [code, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
