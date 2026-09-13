import { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/servicesData";
import ServiceDetail from "@/components/Services/ServiceDetail";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ServiceCTA from "@/components/Services/ServiceCTA";

const service = servicesData.find((s) => s.slug === "business-registration");

export const metadata: Metadata = {
  title: "CAC Business Registration & Incorporation Services | HambakTech",
  description:
    "Official Corporate Affairs Commission (CAC) business name registration, limited liability incorporation, and TIN linkage support.",
  openGraph: {
    title: "CAC Business Registration & Incorporation Services | HambakTech",
    description:
      "Official Corporate Affairs Commission (CAC) business name registration, limited liability incorporation, and TIN linkage support.",
    url: "https://hambaktech.com.ng/services/business-registration",
  },
};

export default function BusinessRegistrationPage() {
  if (!service) notFound();

  return (
    <>
      <Breadcrumb
        pageName="Business Registration (CAC)"
        description="Formalize your enterprise: CAC business name, limited liability incorporation, and TIN support."
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
