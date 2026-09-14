"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Award,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function CertificateLookupPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) return;
    router.push(`/verify/certificate/${encodeURIComponent(cleanCode)}`);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50 dark:bg-black text-dark dark:text-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Credential Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-dark dark:text-white">
            Verify HambakTech Academic Certificate
          </h1>
          <p className="mt-3 text-sm sm:text-base text-body-color dark:text-body-color-dark max-w-xl mx-auto leading-relaxed">
            Instantly validate the authenticity, course completion status, and academic credentials issued by the HambakTech Institute of Information Technology.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-8 shadow-sm mb-10">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="certificate-code-input" className="block text-xs font-bold uppercase tracking-wider text-dark dark:text-white mb-2">
                Enter Certificate Number or Verification Hash
              </label>
              <div className="relative">
                <input
                  id="certificate-code-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. HT-CERT-2026-0001"
                  required
                  className="w-full px-5 py-4 pl-12 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white text-base focus:border-primary focus:outline-none font-mono"
                />
                <Search className="w-5 h-5 text-body-color absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              id="submit-verify-btn"
              type="submit"
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Verify Credential Authenticity</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark flex items-center justify-between text-xs text-body-color">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              Privacy protected registry
            </span>
            <span className="font-mono">Format: HT-CERT-YYYY-XXXX</span>
          </div>
        </div>

        {/* Information Callout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-dark dark:text-white mb-1">For Employers & Institutions</h3>
            <p className="text-xs text-body-color leading-relaxed">
              Verify qualifications presented by job candidates. All certificates are cryptographically tracked against our student database.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-dark dark:text-white mb-1">QR Code Quick Scanning</h3>
            <p className="text-xs text-body-color leading-relaxed">
              Every printed certificate and student ID card features a scannable QR code that resolves directly to our secure verification portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
