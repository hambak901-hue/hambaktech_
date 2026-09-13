import { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/servicesData";
import ServiceDetail from "@/components/Services/ServiceDetail";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ServiceCTA from "@/components/Services/ServiceCTA";

const service = servicesData.find((s) => s.slug === "nin-centre");

export const metadata: Metadata = {
  title: "NIN Centre Support & Slip Retrieval | HambakTech",
  description:
    "National Identification Number (NIN) assistance, slip retrieval guidance, verification support, and modification procedures in Ibeju-Lekki, Lagos.",
  openGraph: {
    title: "NIN Centre Support & Slip Retrieval | HambakTech",
    description:
      "National Identification Number (NIN) assistance, slip retrieval guidance, verification support, and modification procedures in Ibeju-Lekki, Lagos.",
    url: "https://hambaktech.com.ng/services/nin-centre",
  },
};

export default function NinCentrePage() {
  if (!service) notFound();

  return (
    <>
      <Breadcrumb
        pageName="NIN Centre Support"
        description="National Identification Number enrollment guidelines, slip retrieval, verification, and modification guidance."
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
