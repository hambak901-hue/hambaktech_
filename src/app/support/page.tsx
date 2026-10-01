import { Metadata } from "next";
import { Suspense } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ContactForm from "@/components/Contact/ContactForm";

export const metadata: Metadata = {
  title: "Support & Help Desk | HambakTech Smart Digital Platform",
  description:
    "Official customer support desk for HambakTech. Submit service inquiries, track orders, or contact our support team in Ibeju-Lekki, Lagos.",
  openGraph: {
    title: "Support & Help Desk | HambakTech Smart Digital Platform",
    description:
      "Official customer support desk for HambakTech. Submit service inquiries, track orders, or contact our support team in Ibeju-Lekki, Lagos.",
    url: "https://hambaktech.com.ng/support",
  },
};

export default function SupportPage() {
  return (
    <>
      <Breadcrumb
        pageName="Customer Support Desk"
        description="Submit a service ticket, check inquiry status, or contact our dedicated helpdesk team."
      />

      <section className="pb-16 pt-8 md:pb-20 lg:pb-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <Suspense fallback={<div className="py-16 text-center text-body-color">Loading support desk...</div>}>
            <ContactForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
