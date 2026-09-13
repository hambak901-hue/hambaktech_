import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  showSlogan?: boolean;
}

export default function BrandLogo({ className = "", showSlogan = false }: BrandLogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-3 group ${className}`}>
      {/* 
        HambakTech Brand Emblem
        Standardized brand vector mark for HambakTech & Services.
        Easily swappable with official high-res vector file when provided.
      */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Stylized 'H' & tech node motif */}
          <path d="M5 4v16" />
          <path d="M19 4v16" />
          <path d="M5 12h14" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-tight text-dark dark:text-white font-sans">
            HAMBAK<span className="text-primary">TECH</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:bg-primary/20">
            Services
          </span>
        </div>
        {showSlogan && (
          <span className="text-[11px] text-body-color dark:text-body-color-dark font-medium tracking-wide">
            Where Technology Meet Service
          </span>
        )}
      </div>
    </Link>
  );
}
