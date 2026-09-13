import { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/servicesData";
import ServiceDetail from "@/components/Services/ServiceDetail";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ServiceCTA from "@/components/Services/ServiceCTA";

const service = servicesData.find((s) => s.slug === "vtu-bill-payments");

export const metadata: Metadata = {
  title: "VTU Airtime, Data & Bill Payments | HambakTech",
  description:
    "Instant airtime top-up, data bundles, electricity DISCO token recharges, and cable TV subscriptions through HambakTech.",
  openGraph: {
    title: "VTU Airtime, Data & Bill Payments | HambakTech",
    description:
      "Instant airtime top-up, data bundles, electricity DISCO token recharges, and cable TV subscriptions through HambakTech.",
    url: "https://hambaktech.com.ng/services/vtu-bill-payments",
  },
};

export default function VtuBillPaymentsPage() {
  if (!service) notFound();

  return (
    <>
      <Breadcrumb
        pageName="VTU & Bill Payments"
        description="Airtime top-up, data subscriptions, electricity DISCO token recharges, and cable TV renewals."
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
