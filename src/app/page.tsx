import { Metadata } from "next";
import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import HomeServicesOverview from "@/components/Services/HomeServicesOverview";
import WhyHambakTech from "@/components/WhyHambakTech";
import HowItWorks from "@/components/HowItWorks";
import PlatformPreview from "@/components/PlatformPreview";
import AcademyPreview from "@/components/Academy/AcademyPreview";
import BusinessCentre from "@/components/BusinessCentre";
import Trust from "@/components/Trust";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/Common/FinalCTA";

export const metadata: Metadata = {
  title: "HambakTech — Where Technology Meet Service | Smart Digital Platform",
  description:
    "Official website of HambakTech & Services. Combining physical business-centre operations, CAC registration, ICT academy, and modern digital platform solutions in Ibeju-Lekki, Lagos.",
  openGraph: {
    title: "HambakTech — Where Technology Meet Service | Smart Digital Platform",
    description:
      "Official website of HambakTech & Services. Combining physical business-centre operations, CAC registration, ICT academy, and modern digital platform solutions in Ibeju-Lekki, Lagos.",
    url: "https://hambaktech.com.ng",
    siteName: "HambakTech",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      {/* 1. Hero */}
      <Hero />

      {/* 2. Services Overview (9 Categories) */}
      <HomeServicesOverview />

      {/* 3. Why HambakTech */}
      <WhyHambakTech />

      {/* 4. How It Works (6-Step Customer Journey) */}
      <HowItWorks />

      {/* 5. Featured Digital Platform (v1.0 Architecture Preview) */}
      <PlatformPreview />

      {/* 6. Academy Preview */}
      <AcademyPreview />

      {/* 7. Physical Business Centre */}
      <BusinessCentre />

      {/* 8. Trust, Privacy & Operational Standards */}
      <Trust />

      {/* 9. FAQ */}
      <FAQ />

      {/* 10. Final Call to Action */}
      <FinalCTA />
    </>
  );
}
