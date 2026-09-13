import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HambakTech — Where Technology Meet Service | Smart Digital Platform",
  description: "HambakTech & Services: Smart digital solutions, business centre, IT academy, and identity services in Ibeju-Lekki, Lagos.",
  openGraph: {
    title: "HambakTech — Where Technology Meet Service | Smart Digital Platform",
    description: "HambakTech & Services: Smart digital solutions, business centre, IT academy, and identity services in Ibeju-Lekki, Lagos.",
    url: "https://hambaktech.com.ng",
    siteName: "HambakTech",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Video />
      <Brands />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Testimonials />
      <Pricing />
      <Blog />
      <Contact />
    </>
  );
}
