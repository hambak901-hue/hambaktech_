"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans text-gray-900">
        <div className="max-w-md text-center">
          <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-6 text-sm text-gray-600">
            A critical system error occurred while loading the application.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
