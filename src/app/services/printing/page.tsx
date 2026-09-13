import { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/servicesData";
import ServiceDetail from "@/components/Services/ServiceDetail";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ServiceCTA from "@/components/Services/ServiceCTA";

const service = servicesData.find((s) => s.slug === "printing");

export const metadata: Metadata = {
  title: "Commercial Printing & Documentation Services | HambakTech",
  description:
    "Quality printing, business cards, letterheads, invoice books, flyers, and corporate documentation in Ibeju-Lekki, Lagos.",
  openGraph: {
    title: "Commercial Printing & Documentation Services | HambakTech",
    description:
      "Quality printing, business cards, letterheads, invoice books, flyers, and corporate documentation in Ibeju-Lekki, Lagos.",
    url: "https://hambaktech.com.ng/services/printing",
  },
};

export default function PrintingPage() {
  if (!service) notFound();

  return (
    <>
      <Breadcrumb
        pageName="Printing & Documentation"
        description="Commercial printing, marketing collaterals, customized business cards, letterheads, and customized booklets."
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
