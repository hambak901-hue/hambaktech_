import { MapPin, Building2, Clock } from "lucide-react";

interface OfficePhotoPlaceholderProps {
  className?: string;
}

export default function OfficePhotoPlaceholder({ className = "" }: OfficePhotoPlaceholderProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-dashed border-stroke dark:border-strokedark bg-gray-1 dark:bg-gray-dark p-8 text-center flex flex-col items-center justify-center min-h-[340px] ${className}`}
    >
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
        <Building2 className="w-8 h-8" />
      </div>

      <div className="max-w-md">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 mb-2">
          Physical Facility Showcase
        </span>
        <h3 className="text-xl font-bold text-dark dark:text-white mb-2">
          HambakTech Technology & Business Centre
        </h3>
        <p className="text-sm text-body-color dark:text-body-color-dark mb-4 leading-relaxed">
          Our physical office in Ibeju-Lekki, Lagos is open to the public for all clerical, printing, NIN, CAC, and digital service needs.
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
