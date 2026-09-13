import Link from "next/link";
import { ServiceCategory } from "@/types/service";
import StatusBadge from "@/components/Common/StatusBadge";
import {
  Laptop,
  Printer,
  FileText,
  ShieldCheck,
  Smartphone,
  Building2,
  Globe,
  Palette,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Laptop,
  Printer,
  FileText,
  ShieldCheck,
  Smartphone,
  Building2,
  Globe,
  Palette,
  GraduationCap,
};

interface ServiceCardProps {
  service: ServiceCategory;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const IconComponent = iconMap[service.iconName] || FileText;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-dark p-6 sm:p-8 shadow-sm hover:shadow-md border border-stroke dark:border-strokedark transition-all duration-300 hover:-translate-y-1">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 group-hover:bg-primary group-hover:text-white transition duration-300">
            <IconComponent className="w-7 h-7" />
          </div>
          <StatusBadge availability={service.onlineAvailability} />
        </div>

        <h3 className="text-xl font-bold text-dark dark:text-white mb-3 group-hover:text-primary transition duration-200">
          <Link href={`/services/${service.slug}`}>{service.title}</Link>
        </h3>

        <p className="text-sm leading-relaxed text-body-color dark:text-body-color-dark mb-6">
          {service.shortDescription}
        </p>

        <div className="space-y-2 mb-6">
          {service.features.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-body-color dark:text-body-color-dark">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-stroke/60 dark:border-strokedark/60 flex items-center justify-between">
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition duration-200"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href={service.ctaLink}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-1 dark:bg-gray-dark text-dark dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary transition duration-200"
        >
          {service.status === "coming_soon" ? "Join Waitlist" : "Inquire"}
        </Link>
      </div>
    </div>
  );
}
