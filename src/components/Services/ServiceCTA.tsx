import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";

export default function ServiceCTA() {
  return (
    <section className="relative py-16 bg-gray-1 dark:bg-gray-dark border-y border-stroke dark:border-strokedark">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-3">
            Custom Requirements
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white mb-4">
            Need a tailored service or enterprise volume package?
          </h2>
          <p className="text-sm sm:text-base text-body-color dark:text-body-color-dark mb-8 leading-relaxed">
            From bulk corporate document printing and recurring clerical support to bespoke software development and organization-wide CAC structuring, HambakTech delivers reliable service solutions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-primary text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition duration-200"
            >
              <span>Contact Business Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-dark border border-stroke dark:border-strokedark text-sm font-semibold text-dark dark:text-white hover:border-primary hover:text-primary transition duration-200"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Read Common Questions</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
