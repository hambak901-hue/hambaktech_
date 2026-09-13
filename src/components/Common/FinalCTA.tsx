import Link from "next/link";
import { ArrowRight, PhoneCall } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 text-white overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-white/10 text-white border border-white/20 mb-4">
            Where Technology Meet Service
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            Ready to get started with HambakTech?
          </h2>
          <p className="text-base sm:text-lg text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
            From daily document printing and business centre tasks to full CAC company registration, web development, and digital literacy training, we are here to support you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary text-base font-bold shadow-lg hover:bg-gray-100 transition duration-200"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/40 text-white text-base font-semibold hover:bg-white/10 transition duration-200"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact HambakTech</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
