import { ServiceStatus, OnlineAvailability } from "@/types/service";

interface StatusBadgeProps {
  status?: ServiceStatus;
  availability?: OnlineAvailability;
  className?: string;
}

export default function StatusBadge({
  status,
  availability,
  className = "",
}: StatusBadgeProps) {
  if (availability) {
    switch (availability) {
      case "Physical Walk-in & Online":
        return (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}
          >
            Walk-in & Online
          </span>
        );
      case "Online Request":
        return (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${className}`}
          >
            Online Request
          </span>
        );
      case "Physical Walk-in Only":
        return (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}
          >
            Physical In-Centre
          </span>
        );
      case "Coming Soon":
        return (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 ${className}`}
          >
            Coming Soon
          </span>
        );
    }
  }

  if (status) {
    switch (status) {
      case "available":
        return (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}
          >
            Active & Available
          </span>
        );
      case "request_only":
        return (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${className}`}
          >
            By Consultation
          </span>
        );
      case "coming_soon":
        return (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 ${className}`}
          >
            Platform v1.0 Coming Soon
          </span>
        );
    }
  }

  return null;
}
