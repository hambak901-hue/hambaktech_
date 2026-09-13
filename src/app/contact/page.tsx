import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ContactForm from "@/components/Contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact HambakTech | Office Location, Hours & Inquiries",
  description:
    "Contact HambakTech & Services in Ibeju-Lekki, Lagos. Physical office hours, customer support email, and service inquiry submission.",
  openGraph: {
    title: "Contact HambakTech | Office Location, Hours & Inquiries",
    description:
      "Contact HambakTech & Services in Ibeju-Lekki, Lagos. Physical office hours, customer support email, and service inquiry submission.",
    url: "https://hambaktech.com.ng/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <Breadcrumb
        pageName="Contact HambakTech"
        description="Reach out to our customer support desk or visit our physical business centre in Ibeju-Lekki, Lagos."
      />

      <section className="pb-16 pt-8 md:pb-20 lg:pb-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
