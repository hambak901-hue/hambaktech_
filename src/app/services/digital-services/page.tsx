import { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/servicesData";
import ServiceDetail from "@/components/Services/ServiceDetail";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ServiceCTA from "@/components/Services/ServiceCTA";

const service = servicesData.find((s) => s.slug === "digital-services");

export const metadata: Metadata = {
  title: "Digital Services & Online Portal Assistance | HambakTech",
  description:
    "Expert digital assistance for online portal submissions, format conversion, document digitization, and technical support in Ibeju-Lekki, Lagos.",
  openGraph: {
    title: "Digital Services & Online Portal Assistance | HambakTech",
    description:
      "Expert digital assistance for online portal submissions, format conversion, document digitization, and technical support in Ibeju-Lekki, Lagos.",
    url: "https://hambaktech.com.ng/services/digital-services",
  },
};

export default function DigitalServicesPage() {
  if (!service) notFound();

  return (
    <>
      <Breadcrumb
        pageName="Digital Services"
        description="Assistance with online registrations, portal applications, document digitization, and technical setup."
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
