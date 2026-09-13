import {
  Shield,
  FileText,
  BadgeDollarSign,
  MessageSquare,
  Lock,
  Headphones,
} from "lucide-react";
import EmptyState from "@/components/Common/EmptyState";

const trustGuarantees = [
  {
    icon: BadgeDollarSign,
    title: "Transparent Pricing",
    description:
      "Every fee and quotation is itemized upfront before project work begins. Zero undisclosed surcharges.",
  },
  {
    icon: Lock,
    title: "Strict Data Confidentiality",
    description:
      "Personal identity records, CAC certificates, academic documents, and source manuscripts are secured with strict handling privacy.",
  },
  {
    icon: MessageSquare,
    title: "Proactive Communication",
    description:
      "Direct updates via WhatsApp, phone, or email regarding timeline milestones, proof reviews, and collection readiness.",
  },
  {
    icon: Headphones,
    title: "Accessible Human Support",
    description:
      "Real professionals in our physical office and on our helpdesk to address your inquiries and revisions.",
  },
];

export default function Trust() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gray-1 dark:bg-gray-dark/40 border-y border-stroke dark:border-strokedark">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-3">
            Standards & Governance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
            Built on Integrity, Accountability, and Care
          </h2>
          <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed">
            Whether we are printing a single document or managing a comprehensive corporate incorporation, we adhere to strict operating standards.
          </p>
        </div>

        {/* Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustGuarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-dark dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-body-color dark:text-body-color-dark leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Genuine Customer Feedback Status (Zero Fake Reviews Rule) */}
        <div className="max-w-2xl mx-auto">
          <EmptyState
            title="Verified Client Reviews — Coming Soon"
            description="We believe in genuine, verifiable customer experiences rather than synthetic testimonials. Verified customer reviews will be published here following the launch of our digital review collection portal."
            actionText="Share Your Feedback / Contact Us"
            actionHref="/contact"
          />
        </div>
      </div>
    </section>
  );
}
