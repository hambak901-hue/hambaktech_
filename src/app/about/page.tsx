import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import OfficePhotoPlaceholder from "@/components/Common/OfficePhotoPlaceholder";
import ServiceCTA from "@/components/Services/ServiceCTA";
import {
  ShieldCheck,
  Target,
  Eye,
  HeartHandshake,
  CheckCircle2,
  Building2,
  Cpu,
  GraduationCap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About HambakTech & Services | Where Technology Meet Service",
  description:
    "Learn about HambakTech: our dual-model combining a physical technology and business service centre in Ibeju-Lekki, Lagos, with an evolving digital services platform.",
  openGraph: {
    title: "About HambakTech & Services | Where Technology Meet Service",
    description:
      "Learn about HambakTech: our dual-model combining a physical technology and business service centre in Ibeju-Lekki, Lagos, with an evolving digital services platform.",
    url: "https://hambaktech.com.ng/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumb
        pageName="About HambakTech"
        description="Bridging neighborhood accessibility and modern digital technology under one dependable roof."
      />

      <section className="pb-16 pt-8 md:pb-20 lg:pb-28">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Company Story & Dual Model */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-3">
                Our Story & Purpose
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-6 leading-tight">
                Where Technology Meet Service
              </h2>
              <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed mb-4">
                HambakTech (legally registered as <strong>Hambaktech & Services</strong> with Nigeria&apos;s Corporate Affairs Commission) was founded on a simple observation: individuals, artisans, students, and businesses need both immediate physical clerical support and modern digital solutions.
              </p>
              <p className="text-base text-body-color dark:text-body-color-dark leading-relaxed mb-6">
                Rather than choosing between a traditional neighborhood business centre and an impersonal remote agency, HambakTech integrates both worlds. We operate a physical service hub in Ibeju-Lekki, Lagos, while engineering our expanding digital platform to facilitate seamless online requests.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-dark dark:text-white font-medium">
                    Corporate Affairs Commission (CAC) Registered Nigerian Entity
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-dark dark:text-white font-medium">
                    Physical service centre providing on-demand walk-in support
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-dark dark:text-white font-medium">
                    Continuous investment in local digital skills via HambakTech Academy
                  </span>
                </div>
              </div>
            </div>

            {/* Office Placeholder */}
            <div>
              <OfficePhotoPlaceholder />
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-dark dark:text-white mb-3">
                Our Mission
              </h3>
              <p className="text-sm sm:text-base text-body-color dark:text-body-color-dark leading-relaxed">
                To deliver accessible, dependable, and high-quality technology solutions and business-centre services that simplify documentation, empower enterprise growth, and foster marketable digital skills.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-dark dark:text-white mb-3">
                Our Vision
              </h3>
              <p className="text-sm sm:text-base text-body-color dark:text-body-color-dark leading-relaxed">
                To become a premier hybrid service institution across Lagos and Nigeria, renowned for fusing warm, human-centered physical assistance with cutting-edge digital platform capabilities.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-2">
                Our Foundation
              </span>
              <h3 className="text-3xl font-extrabold text-dark dark:text-white">
                Core Operating Principles
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark">
                <ShieldCheck className="w-8 h-8 text-primary mb-4" />
                <h4 className="text-base font-bold text-dark dark:text-white mb-2">
                  Integrity & Trust
                </h4>
                <p className="text-xs text-body-color dark:text-body-color-dark leading-relaxed">
                  Transparent pricing, honest turnaround estimates, and strict protection of client confidential records.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark">
                <HeartHandshake className="w-8 h-8 text-primary mb-4" />
                <h4 className="text-base font-bold text-dark dark:text-white mb-2">
                  Customer Empathy
                </h4>
                <p className="text-xs text-body-color dark:text-body-color-dark leading-relaxed">
                  Patient, attentive support for clients of every technical skill level, ensuring no one is left behind.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark">
                <Cpu className="w-8 h-8 text-primary mb-4" />
                <h4 className="text-base font-bold text-dark dark:text-white mb-2">
                  Technological Craft
                </h4>
                <p className="text-xs text-body-color dark:text-body-color-dark leading-relaxed">
                  Modern hardware, calibrated color printing, and robust software standards that deliver lasting results.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark">
                <GraduationCap className="w-8 h-8 text-primary mb-4" />
                <h4 className="text-base font-bold text-dark dark:text-white mb-2">
                  Skills Empowerment
                </h4>
                <p className="text-xs text-body-color dark:text-body-color-dark leading-relaxed">
                  Equipping local community members with practical computing competency for career and enterprise success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceCTA />
    </>
  );
}
