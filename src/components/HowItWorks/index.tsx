import {
  FileSearch,
  FileUp,
  Receipt,
  CreditCard,
  Activity,
  PackageCheck,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: FileSearch,
    title: "Select Your Service",
    description:
      "Explore our service categories online or walk into our Ibeju-Lekki centre to discuss your specific needs.",
  },
  {
    step: "02",
    icon: FileUp,
    title: "Submit Requirements",
    description:
      "Provide necessary documents, manuscripts, artwork briefs, or registration credentials safely to our team.",
  },
  {
    step: "03",
    icon: Receipt,
    title: "Review Scope & Quote",
    description:
      "Receive transparent itemized pricing, turnaround milestones, and verification checks prior to work commencing.",
  },
  {
    step: "04",
    icon: CreditCard,
    title: "Secure Payment",
    description:
      "Pay securely using in-centre POS/Cash, verified bank transfer, or our upcoming customer digital wallet.",
  },
  {
    step: "05",
    icon: Activity,
    title: "Service Execution & Updates",
    description:
      "Our team processes your documentation, print run, or development work, keeping you updated on progress.",
  },
  {
    step: "06",
    icon: PackageCheck,
    title: "Collect or Receive Deliverables",
    description:
      "Pick up your neatly bound prints, certificates, and documents at our centre, or download digital assets securely.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gray-1 dark:bg-gray-dark/50 border-y border-stroke dark:border-strokedark">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-3">
            Simple & Transparent
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
            How HambakTech Services Work
          </h2>
          <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed">
            Whether visiting our physical desk or requesting services remotely, our structured 6-step workflow guarantees clarity at every touchpoint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-primary/30 dark:text-primary/40 font-mono">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-dark dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-body-color dark:text-body-color-dark leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-body-color dark:text-body-color-dark max-w-xl mx-auto italic">
            * For services not yet fully self-service online (e.g. automated bill payments & direct wallet checkouts), requests are facilitated directly through our customer service desk.
          </p>
        </div>
      </div>
    </section>
  );
}
