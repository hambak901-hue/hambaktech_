import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  showSlogan?: boolean;
  variant?: "horizontal" | "stacked" | "mark";
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * HambakTech Brand Identity Component (Replaceable Architecture)
 * Centralized brand display component awaiting owner-supplied official logo asset.
 * Any future official logo asset will be slotted in here without touching layout consumers.
 */
export function HambakEmblem({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-sm`}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Aperture / quadrant gap cutouts */}
        <mask id="brand-quadrant-mask">
          <rect width="320" height="320" fill="#FFFFFF" />
          <rect x="0" y="148" width="320" height="24" fill="#000000" />
          <rect x="148" y="0" width="24" height="320" fill="#000000" />
        </mask>

        <linearGradient id="b-lobe-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FACD74" />
          <stop offset="100%" stopColor="#EEA738" />
        </linearGradient>
        <linearGradient id="b-lobe-bevel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9741B" />
          <stop offset="100%" stopColor="#9C5209" />
        </linearGradient>
      </defs>

      {/* 4-Quadrant Segmented Outer Ring */}
      <path
        d="M 160 25 A 135 135 0 1 0 160 295 A 135 135 0 1 0 160 25 Z M 160 75 A 85 85 0 1 1 160 245 A 85 85 0 1 1 160 75 Z"
        fill="#C85A17"
        fillRule="evenodd"
        mask="url(#brand-quadrant-mask)"
      />

      {/* Monogram 'H' (Left) */}
      <g>
        <rect x="108" y="74" width="34" height="172" rx="2" fill="#C85A17" />
        <rect x="140" y="138" width="38" height="44" fill="#C85A17" />
        <rect x="139" y="74" width="3.5" height="172" fill="#9C3E0A" opacity="0.4" />
      </g>

      {/* Monogram 'B' (Right) with 3D bevel depth */}
      <g>
        {/* 3D Depth Extrusion */}
        <path
          d="M 164 78
             H 194
             C 222 78, 240 94, 240 118
             C 240 135, 230 148, 212 154
             C 232 159, 246 176, 246 200
             C 246 228, 224 246, 190 246
             H 164
             Z"
          fill="url(#b-lobe-bevel)"
          transform="translate(3, 3)"
        />

        {/* B Front Face */}
        <path
          d="M 164 76
             H 192
             C 220 76, 238 92, 238 116
             C 238 133, 228 146, 210 152
             C 230 157, 244 174, 244 198
             C 244 226, 222 244, 188 244
             H 164
             Z"
          fill="url(#b-lobe-front)"
        />

        {/* Top inner counter */}
        <path
          d="M 184 98
             H 192
             C 206 98, 214 105, 214 115
             C 214 125, 206 132, 192 132
             H 184
             Z"
          fill="#FFFFFF"
          className="dark:fill-dark"
        />

        {/* Bottom inner counter */}
        <path
          d="M 184 186
             H 192
             C 208 186, 218 194, 218 206
             C 218 217, 208 224, 192 224
             H 184
             Z"
          fill="#FFFFFF"
          className="dark:fill-dark"
        />

        {/* Subtle upper sheen */}
        <path
          d="M 164 76 C 184 76, 208 82, 222 94 C 212 86, 190 80, 164 80 Z"
          fill="#FFF4D6"
          opacity="0.8"
        />
      </g>
    </svg>
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
      <Link href="/" aria-label="HambakTech Home" className={`inline-flex flex-col items-center text-center group ${className}`}>
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

