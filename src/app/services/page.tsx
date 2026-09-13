import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { servicesData } from "@/data/servicesData";
import ServiceGrid from "@/components/Services/ServiceGrid";
import ServiceCTA from "@/components/Services/ServiceCTA";
import { Sparkles, ShieldCheck, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "All Services Directory | HambakTech & Services",
  description:
    "Explore HambakTech's full service offerings: Digital services, physical business centre, commercial printing, NIN support, CAC business registration, VTU, web development, and ICT academy.",
  openGraph: {
    title: "All Services Directory | HambakTech & Services",
    description:
      "Explore HambakTech's full service offerings: Digital services, physical business centre, commercial printing, NIN support, CAC business registration, VTU, web development, and ICT academy.",
    url: "https://hambaktech.com.ng/services",
  },
};

export default function ServicesPage() {
  return (
    <>
      <Breadcrumb
        pageName="Services Directory"
        description="Comprehensive physical and digital services designed for individuals, growing enterprises, and local organizations."
      />

      <section className="pb-16 pt-8 md:pb-20 lg:pb-28">
        <div className="container mx-auto px-4">
          {/* Channel Availability Filter Information */}
          <div className="mb-12 p-6 rounded-2xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-dark dark:text-white">
                Delivery Channels:
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Walk-in & Online
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Online Request
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Platform v1.0 Coming Soon
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-body-color dark:text-body-color-dark">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>Physical Centre: Ibeju-Lekki, Lagos</span>
            </div>
          </div>

          {/* 9 Category Grid */}
          <ServiceGrid services={servicesData} columns={3} />
        </div>
      </section>

      {/* Reusable Bottom CTA */}
      <ServiceCTA />
    </>
  );
}
