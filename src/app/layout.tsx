import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Providers } from "./providers";
import "../styles/index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "HambakTech — Where Technology Meet Service | Smart Digital Platform",
    template: "%s | HambakTech",
  },
  description:
    "HambakTech & Services - Where Technology Meet Service. Smart Digital Platform.",
  openGraph: {
    title: "HambakTech — Where Technology Meet Service | Smart Digital Platform",
    description:
      "HambakTech & Services - Where Technology Meet Service. Smart Digital Platform.",
    url: "https://hambaktech.com.ng",
    siteName: "HambakTech",
    type: "website",
  },
  icons: {
    icon: "/images/brand/favicon/hambaktech-favicon.svg",
    shortcut: "/images/brand/favicon/hambaktech-favicon.svg",
    apple: "/images/brand/favicon/hambaktech-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <Providers>
          <div className="isolate">
            <Header />
            {children}
            <Footer />
          </div>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
