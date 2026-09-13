import { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/servicesData";
import ServiceDetail from "@/components/Services/ServiceDetail";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ServiceCTA from "@/components/Services/ServiceCTA";

const service = servicesData.find((s) => s.slug === "web-software");

export const metadata: Metadata = {
  title: "Web & Custom Software Development Solutions | HambakTech",
  description:
    "Mobile-first corporate websites, custom web applications, e-commerce storefronts, domain registration, and cloud hosting management.",
  openGraph: {
    title: "Web & Custom Software Development Solutions | HambakTech",
    description:
      "Mobile-first corporate websites, custom web applications, e-commerce storefronts, domain registration, and cloud hosting management.",
    url: "https://hambaktech.com.ng/services/web-software",
  },
};

export default function WebSoftwarePage() {
  if (!service) notFound();

  return (
    <>
      <Breadcrumb
        pageName="Web & Software Solutions"
        description="Responsive corporate websites, custom portals, e-commerce platforms, and cloud hosting management."
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
