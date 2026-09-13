import Link from "next/link";
import BrandLogo from "@/components/Common/BrandLogo";
import { MapPin, Mail, Clock, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-white dark:bg-gray-dark border-t border-stroke dark:border-strokedark pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo showSlogan={true} />
            <p className="text-sm leading-relaxed text-body-color dark:text-body-color-dark max-w-sm pt-2">
              HambakTech & Services combines physical business-centre operations, ICT education, and digital solutions under one unified service platform in Ibeju-Lekki, Lagos.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-body-color dark:text-body-color-dark">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Ibeju-Lekki, Lagos State, Nigeria</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a
                  href="mailto:support@hambaktech.com.ng"
                  className="hover:text-primary transition duration-200"
                >
                  support@hambaktech.com.ng
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>Monday – Saturday: 8:00 AM – 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Column 1: Core Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-white mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/services/digital-services"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Digital Services
                </Link>
              </li>
              <li>
                <Link
                  href="/services/business-centre"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Business Centre
                </Link>
              </li>
              <li>
                <Link
                  href="/services/printing"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Printing & Documents
                </Link>
              </li>
              <li>
                <Link
                  href="/services/nin-centre"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  NIN Support Desk
                </Link>
              </li>
              <li>
                <Link
                  href="/services/business-registration"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  CAC Business Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/services/vtu-bill-payments"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  VTU & Bill Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions & Training */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-white mb-4">
              Solutions & Academy
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/services/web-software"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Web & Software
                </Link>
              </li>
              <li>
                <Link
                  href="/services/graphics-branding"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Graphics & Branding
                </Link>
              </li>
              <li>
                <Link
                  href="/academy"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  HambakTech Academy
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  All Services Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Company */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-white mb-4">
              Company & Access
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  About HambakTech
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Contact & Location
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Technology Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-body-color dark:text-body-color-dark hover:text-primary dark:hover:text-primary transition duration-200"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal and Compliance Bar */}
        <div className="pt-8 border-t border-stroke/70 dark:border-strokedark/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-body-color dark:text-body-color-dark">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>
              Hambaktech & Services — Registered with the Corporate Affairs Commission (CAC), Nigeria.
            </span>
          </div>
          <div className="text-center sm:text-right">
            <span>© {new Date().getFullYear()} HambakTech. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
