import Link from "next/link";
import { servicesData } from "@/data/servicesData";
import ServiceGrid from "./ServiceGrid";
import { ArrowRight } from "lucide-react";

export default function HomeServicesOverview() {
  return (
    <section id="services-overview" className="py-16 md:py-20 lg:py-24 bg-gray-1 dark:bg-gray-dark/50 border-t border-stroke dark:border-strokedark">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-3">
              Comprehensive Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
              Explore HambakTech Services
            </h2>
            <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed">
              From everyday office tasks and government identity support to corporate incorporation, custom software engineering, and certified ICT training.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-sm font-semibold text-dark dark:text-white hover:border-primary hover:text-primary transition duration-200 shrink-0"
          >
            <span>View All 9 Service Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 9 Service Categories Grid */}
        <ServiceGrid services={servicesData} columns={3} />
      </div>
    </section>
  );
}
