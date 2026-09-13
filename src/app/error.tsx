"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client-side error
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <section className="relative z-10 pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[600px] text-center">
              <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 text-red-500">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl">
                Something went wrong
              </h1>
              <p className="mb-8 text-base font-medium text-body-color dark:text-body-color-dark sm:text-lg">
                An unexpected condition was encountered. Our operational team has been alerted. You may attempt to recover this session or return to the homepage.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="rounded-sm bg-primary px-8 py-3 text-base font-semibold text-white shadow-signUp duration-300 hover:bg-primary/90"
                >
                  Try Again
                </button>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/"
                  className="rounded-sm border border-stroke dark:border-strokedark px-8 py-3 text-base font-semibold text-dark dark:text-white duration-300 hover:border-primary hover:text-primary"
                >
                  Return to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
