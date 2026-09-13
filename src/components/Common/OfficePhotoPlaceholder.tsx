import { MapPin, Clock } from "lucide-react";
import { HambakEmblem } from "@/components/Common/BrandLogo";

interface OfficePhotoPlaceholderProps {
  className?: string;
}

export default function OfficePhotoPlaceholder({ className = "" }: OfficePhotoPlaceholderProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-dashed border-[#C85A17]/30 dark:border-[#C85A17]/40 bg-gradient-to-b from-[#C85A17]/5 via-gray-1 to-white dark:from-[#C85A17]/10 dark:via-gray-dark dark:to-dark p-8 text-center flex flex-col items-center justify-center min-h-[360px] ${className}`}
    >
      {/* Official Hambak Brand Logo Emblem */}
      <div className="mb-4 relative">
        <div className="p-3 rounded-2xl bg-white dark:bg-dark shadow-sm border border-stroke dark:border-strokedark">
          <HambakEmblem className="w-16 h-16" />
        </div>
      </div>

      <div className="max-w-md">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#C85A17] dark:text-[#E46E28] px-3 py-1 rounded-full bg-[#C85A17]/10 dark:bg-[#C85A17]/20 mb-2">
          Physical Facility &amp; Head Office
        </span>
        <h3 className="text-xl font-bold text-dark dark:text-white mb-2">
          HambakTech Technology &amp; Business Centre
        </h3>
        <p className="text-sm text-body-color dark:text-body-color-dark mb-4 leading-relaxed">
          Our physical hub in Ibeju-Lekki, Lagos welcomes clients for all digital, clerical, printing, NIN, CAC, and enterprise computing services.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md text-left text-xs bg-white dark:bg-dark p-4 rounded-xl border border-stroke dark:border-strokedark">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span className="text-body-color dark:text-body-color-dark">
            <strong className="text-dark dark:text-white block">Location</strong>
            Ibeju-Lekki, Lagos State, Nigeria
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span className="text-body-color dark:text-body-color-dark">
            <strong className="text-dark dark:text-white block">Office Hours</strong>
            Mon – Sat: 8:00 AM – 6:00 PM
          </span>
        </div>
      </div>

      <p className="text-[11px] text-body-color/70 dark:text-body-color-dark/70 mt-4 italic">
        * Official facility photography pending upload from company administration.
      </p>
    </div>
  );
}
