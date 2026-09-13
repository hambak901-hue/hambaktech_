import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative z-10 overflow-hidden pt-[120px] pb-16 md:pt-[150px] md:pb-20 lg:pt-[180px] lg:pb-28 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent dark:from-primary/[0.02]"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Digital Platform & Physical Hub</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CAC Registered Entity</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-1 dark:bg-gray-dark text-body-color dark:text-body-color-dark border border-stroke dark:border-strokedark">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Ibeju-Lekki, Lagos</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-dark dark:text-white mb-6 leading-[1.15]">
            Technology Solutions.{" "}
            <span className="text-primary block sm:inline">Digital Services.</span>{" "}
            Real-World Support.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-body-color dark:text-body-color-dark mb-10 max-w-2xl leading-relaxed">
            HambakTech combines modern digital solutions, physical business-centre operations, corporate services, and practical ICT skills training under one dependable roof in Lagos.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-base font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary/90 transition duration-200"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-base font-semibold text-dark dark:text-white hover:border-primary hover:text-primary transition duration-200"
            >
              <span>Get Started</span>
            </Link>
          </div>

          {/* Highlights bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl pt-8 border-t border-stroke/70 dark:border-strokedark/70 text-left">
            <div className="p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                Walk-in & Online
              </p>
              <p className="text-sm font-bold text-dark dark:text-white">
                Business Centre Hub
              </p>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                Advisory & Filing
              </p>
              <p className="text-sm font-bold text-dark dark:text-white">
                CAC Registration
              </p>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                Hands-on Lab
              </p>
              <p className="text-sm font-bold text-dark dark:text-white">
                ICT Skills Academy
              </p>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                Engineering
              </p>
              <p className="text-sm font-bold text-dark dark:text-white">
                Web & Software
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
