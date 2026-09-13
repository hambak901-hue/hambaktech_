import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | HambakTech & Services",
  description: "The page you are looking for does not exist. Return to HambakTech homepage.",
};

export default function NotFound() {
  return (
    <section className="relative z-10 pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[600px] text-center">
              <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary">
                <span className="text-4xl font-bold">404</span>
              </div>
              <h1 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl">
                Page Not Found
              </h1>
              <p className="mb-8 text-base font-medium text-body-color dark:text-body-color-dark sm:text-lg">
                The resource or service you requested could not be located. It may have been moved, renamed, or is temporarily unavailable.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/"
                  className="rounded-sm bg-primary px-8 py-3 text-base font-semibold text-white shadow-signUp duration-300 hover:bg-primary/90"
                >
                  Return to Home
                </Link>
                <Link
                  href="/contact"
                  className="rounded-sm border border-stroke dark:border-strokedark px-8 py-3 text-base font-semibold text-dark dark:text-white duration-300 hover:border-primary hover:text-primary"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
