import Link from "next/link";
import { ServiceCategory } from "@/types/service";
import StatusBadge from "@/components/Common/StatusBadge";
import {
  CheckCircle2,
  FileCheck2,
  Clock,
  Users,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Send,
} from "lucide-react";

interface ServiceDetailProps {
  service: ServiceCategory;
}

export default function ServiceDetail({ service }: ServiceDetailProps) {
  return (
    <div className="space-y-12">
      {/* Back button & header */}
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StatusBadge status={service.status} />
          <StatusBadge availability={service.onlineAvailability} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
          {service.title}
        </h1>

        <p className="text-lg leading-relaxed text-body-color dark:text-body-color-dark max-w-3xl">
          {service.fullDescription}
        </p>
      </div>

      {/* Metadata Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4" />
            <span>Estimated Turnaround</span>
          </div>
          <p className="text-sm font-medium text-dark dark:text-white">
            {service.estimatedProcessingTime}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>Target Audience</span>
          </div>
          <p className="text-sm font-medium text-dark dark:text-white">
            {service.targetAudience}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>Channel Delivery</span>
          </div>
          <p className="text-sm font-medium text-dark dark:text-white">
            {service.onlineAvailability}
          </p>
        </div>
      </div>

      {/* Features & Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark">
          <h2 className="text-xl font-bold text-dark dark:text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span>Key Service Scope & Features</span>
          </h2>
          <ul className="space-y-4">
            {service.features.map((feat, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-body-color dark:text-body-color-dark"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark">
          <h2 className="text-xl font-bold text-dark dark:text-white mb-6 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-primary" />
            <span>What You Receive (Deliverables)</span>
          </h2>
          <ul className="space-y-4">
            {service.deliverables.map((deliv, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-body-color dark:text-body-color-dark"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>{deliv}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Requirements & Submission Checklist */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gray-1 dark:bg-gray-dark border border-stroke dark:border-strokedark">
        <h2 className="text-xl font-bold text-dark dark:text-white mb-4">
          Client Requirements & Preparation
        </h2>
        <p className="text-sm text-body-color dark:text-body-color-dark mb-6">
          To ensure timely execution of your service request, please prepare the following items:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {service.requirements.map((req, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-sm text-body-color dark:text-body-color-dark flex items-start gap-3"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                {idx + 1}
              </span>
              <span>{req}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Box */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Ready to proceed with this service?</h3>
          <p className="text-white/80 text-sm max-w-xl">
            {service.status === "coming_soon"
              ? "This automated module is being built for Platform v1.0. Contact us today for manual assistance or to join the priority waitlist."
              : "Submit your inquiry or visit our Ibeju-Lekki business centre for prompt, reliable assistance."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href={service.ctaLink}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-primary font-bold text-sm shadow-md hover:bg-gray-100 transition duration-200"
          >
            <Send className="w-4 h-4" />
            <span>{service.ctaText}</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition duration-200"
          >
            <Calendar className="w-4 h-4" />
            <span>Visit Centre</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
