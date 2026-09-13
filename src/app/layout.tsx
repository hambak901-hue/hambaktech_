import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Providers } from "./providers";
import "../styles/index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HambakTech & Services | Smart Digital Solutions, Business Centre & IT Academy",
  description:
    "Official digital platform for HambakTech & Services: enterprise IT solutions, business services, CAC registration, and professional training in Ibeju-Lekki, Lagos.",
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
