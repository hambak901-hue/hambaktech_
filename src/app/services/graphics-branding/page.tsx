import { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/servicesData";
import ServiceDetail from "@/components/Services/ServiceDetail";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ServiceCTA from "@/components/Services/ServiceCTA";

const service = servicesData.find((s) => s.slug === "graphics-branding");

export const metadata: Metadata = {
  title: "Graphics Design & Corporate Branding Services | HambakTech",
  description:
    "Memorable brand identity design, custom corporate logos, company profiles, social media creative packs, and marketing collateral.",
  openGraph: {
    title: "Graphics Design & Corporate Branding Services | HambakTech",
    description:
      "Memorable brand identity design, custom corporate logos, company profiles, social media creative packs, and marketing collateral.",
    url: "https://hambaktech.com.ng/services/graphics-branding",
  },
};

export default function GraphicsBrandingPage() {
  if (!service) notFound();

  return (
    <>
      <Breadcrumb
        pageName="Graphics & Brand Identity"
        description="Visual identity marks, logos, brand style guidelines, marketing collaterals, and company profiles."
      />
      <section className="pb-16 pt-8 md:pb-20 lg:pb-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <ServiceDetail service={service} />
        </div>
      </section>
      <ServiceCTA />
    </>
  );
}
