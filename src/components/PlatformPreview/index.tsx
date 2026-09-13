import Link from "next/link";
import {
  Wallet,
  ClipboardList,
  Bell,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Clock,
} from "lucide-react";

const upcomingCapabilities = [
  {
    icon: UserCheck,
    title: "Customer Profile & Verification",
    desc: "Single sign-on to store service preferences, contact information, and business documents securely.",
  },
  {
    icon: Wallet,
    title: "Digital Wallet Engine",
    desc: "Fund your account seamlessly via Paystack, Flutterwave, or bank transfer for instant service checkouts.",
  },
  {
    icon: ClipboardList,
    title: "Real-Time Request & Order Tracking",
    desc: "Follow the live status of your print jobs, CAC filings, software projects, and documentation requests.",
  },
  {
    icon: Bell,
    title: "Instant SMS & Email Notifications",
    desc: "Receive real-time alerts as soon as your physical prints are ready for pickup or digital files are approved.",
  },
  {
    icon: GraduationCap,
    title: "HambakTech Academy Portal",
    desc: "Access student course schedules, lecture notes, lab assignments, and verify completion certificates.",
  },
  {
    icon: ShieldCheck,
    title: "Audit Records & Invoicing",
    desc: "Download official tax-compliant invoices and itemized transaction receipts for company accounting.",
  },
];

export default function PlatformPreview() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white dark:bg-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Active Development (Platform v1.0 Roadmap)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
            The Future HambakTech Digital Platform
          </h2>
          <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed">
            We are engineering a self-service web portal that unites our physical business services with seamless 24/7 digital accessibility. Here is what is on the horizon:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {upcomingCapabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-dark dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-body-color dark:text-body-color-dark leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-stroke/50 dark:border-strokedark/50">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                    Milestone 3–5 Feature
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Portal Information Banner */}
        <div className="rounded-2xl p-8 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">
              Have Questions About Upcoming Portal Features?
            </h3>
            <p className="text-sm text-white/80 max-w-xl">
              Reach out to our customer support desk to register interest, schedule institutional training, or discuss corporate services.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact?service=general"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-950 font-bold text-sm shadow-md hover:bg-gray-100 transition duration-200"
            >
              <span>Contact Support Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
