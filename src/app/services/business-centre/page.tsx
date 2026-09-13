import { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/servicesData";
import ServiceDetail from "@/components/Services/ServiceDetail";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ServiceCTA from "@/components/Services/ServiceCTA";

const service = servicesData.find((s) => s.slug === "business-centre");

export const metadata: Metadata = {
  title: "Business Centre Services — Photocopying, Typing, Scanning | HambakTech",
  description:
    "Full-service business centre in Ibeju-Lekki, Lagos: high-speed photocopying, typing, document scanning, thermal lamination, and spiral binding.",
  openGraph: {
    title: "Business Centre Services — Photocopying, Typing, Scanning | HambakTech",
    description:
      "Full-service business centre in Ibeju-Lekki, Lagos: high-speed photocopying, typing, document scanning, thermal lamination, and spiral binding.",
    url: "https://hambaktech.com.ng/services/business-centre",
  },
};

export default function BusinessCentrePage() {
  if (!service) notFound();

  return (
    <>
      <Breadcrumb
        pageName="Business Centre Operations"
        description="Daily clerical and document services: photocopying, secretarial typing, scanning, lamination, and binding."
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
