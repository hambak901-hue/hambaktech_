import Link from "next/link";
import OfficePhotoPlaceholder from "@/components/Common/OfficePhotoPlaceholder";
import {
  Printer,
  Copy,
  Scan,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function BusinessCentre() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white dark:bg-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Office Presentation */}
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-3">
              Physical Walk-in Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-6 leading-tight">
              Full-Service Business Centre in Ibeju-Lekki, Lagos
            </h2>
            <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed mb-6">
              Need immediate secretarial assistance, crisp high-volume document printing, or plastic lamination? HambakTech operates an accessible, air-conditioned physical business centre welcoming students, corporate clients, local businesses, and government contractors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-dark dark:text-white font-medium">
                  High-speed monochrome & color copying
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-dark dark:text-white font-medium">
                  Professional secretarial typing & proofing
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-dark dark:text-white font-medium">
                  Thermal lamination up to A3 dimensions
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-dark dark:text-white font-medium">
                  Spiral & comb document binding
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/services/business-centre"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition duration-200"
              >
                <span>View Business Centre Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-stroke dark:border-strokedark text-sm font-semibold text-dark dark:text-white hover:border-primary hover:text-primary transition duration-200"
              >
                <span>Find Location & Hours</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Architectural Placeholder for Office Photo */}
          <div>
            <OfficePhotoPlaceholder />
          </div>
        </div>
      </div>
    </section>
  );
}
