import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  showSlogan?: boolean;
  variant?: "horizontal" | "stacked" | "mark";
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * HambakTech Brand Identity Component
 * Renders the authoritative logo (logo.png) verified in the canonical project tree.
 */
export function HambakEmblem({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div
      className={`relative ${className} shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-sm flex items-center justify-center`}
    >
      <Image
        src="/logo.png"
        alt="HAMBAK Tech Logo"
        width={160}
        height={160}
        priority
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function BrandLogo({
  className = "",
  showSlogan = false,
  variant = "horizontal",
  size = "md",
}: BrandLogoProps) {
  const emblemSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10 sm:w-11 sm:h-11",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  if (variant === "mark") {
    return (
      <Link href="/" aria-label="HambakTech Home" className={`inline-flex items-center group ${className}`}>
        <HambakEmblem className={emblemSizes[size]} />
      </Link>
    );
  }

  if (variant === "stacked") {
    return (
      <Link
        href="/"
        aria-label="HambakTech Home"
        className={`inline-flex flex-col items-center text-center group ${className}`}
      >
        <HambakEmblem className={emblemSizes[size]} />
        <div className="mt-2.5 flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-dark dark:text-white font-serif">
            HAMBAK
          </span>
          <span className="text-xs sm:text-sm font-bold tracking-wide text-[#C85A17] dark:text-[#E46E28]">
            Tech &amp; Services
          </span>
          {showSlogan && (
            <span className="mt-1 text-[11px] text-body-color dark:text-body-color-dark font-medium tracking-wide">
              Where Technology Meet Service
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href="/" aria-label="HambakTech Home" className={`inline-flex items-center gap-3 group ${className}`}>
      <HambakEmblem className={emblemSizes[size]} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-lg sm:text-xl font-black tracking-tight text-dark dark:text-white font-serif">
            HAMBAK
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#C85A17]/10 text-[#C85A17] dark:bg-[#C85A17]/25 dark:text-[#E46E28]">
            Services
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-bold text-[#C85A17] dark:text-[#E46E28] tracking-tight">
            Tech &amp; Services
          </span>
          {showSlogan && (
            <>
              <span className="text-[10px] text-body-color/60 dark:text-body-color-dark/60">•</span>
              <span className="text-[10px] text-body-color dark:text-body-color-dark font-medium hidden sm:inline">
                Where Technology Meet Service
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
