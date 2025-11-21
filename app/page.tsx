'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import LinkForm from '@/components/LinkForm';
import LinkTable from '@/components/LinkTable';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render the client-side components after mounting to avoid hydration issues
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>TinyLink - URL Shortener</title>
        <meta name="description" content="A simple URL shortener built with Next.js and PostgreSQL" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <main className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              TinyLink
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Shorten your links and track their performance
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-12">
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <LinkForm />
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <LinkTable />
            </div>
          </div>
        </main>

        <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} TinyLink. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
