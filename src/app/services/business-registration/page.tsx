"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Search,
  ArrowRight,
  Clock,
  Award,
  Users,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import platformApi from "@/lib/api-client";
import companyConfig from "@/data/companyConfig";

export default function BusinessRegistrationPublicPage() {
  const [trackRef, setTrackRef] = useState("");
  const [trackResult, setTrackResult] = useState<{
    found: boolean;
    reference?: string;
    proposedName?: string;
    status?: string;
    notes?: string;
  } | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRef.trim()) return;

    const res = platformApi.trackCACRequest(trackRef.trim());
    if (res) {
      setTrackResult({
        found: true,
        reference: res.referenceNumber,
        proposedName: res.proposedName1,
        status: res.status,
        notes: res.notes,
      });
    } else {
      setTrackResult({
        found: false,
        notes: `No active CAC filing found for reference "${trackRef}". Please check your order details.`,
      });
    }
  };

  return (
    <div className="pt-28 pb-20 bg-[#FCFCFC] dark:bg-black text-dark dark:text-white">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-body-color">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-primary">Services</Link>
          <span>/</span>
          <span className="text-dark dark:text-white font-medium">Business Registration</span>
        </div>

        {/* Hero Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold mb-3">
              <Building2 className="w-4 h-4" />
              <span>Accredited Corporate Affairs Support & Filing</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-dark dark:text-white">
              Corporate CAC Business Registration Desk
            </h1>
            <p className="mt-4 text-sm sm:text-base text-body-color dark:text-body-color-dark leading-relaxed">
              Legitimize your enterprise with complete Corporate Affairs Commission (CAC) registration in Nigeria. Get your official Certificate of Incorporation, CAC Status Report, and automated Tax Identification Number (TIN) without hassles.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard/cac"
                className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-md shadow-primary/25 inline-flex items-center gap-2"
              >
                <span>Start Business Registration</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#tracker"
                className="px-6 py-3 rounded-2xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-dark transition inline-flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-primary" />
                <span>Track Existing Filing</span>
              </a>
            </div>
          </div>
        </div>

        {/* Pricing & Packages */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Standardized Corporate Packages
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white mt-1">
              Transparent Pricing With All Official Fees Included
            </h2>
            <p className="text-xs sm:text-sm text-body-color mt-2">
              No hidden stamp duties or surcharges. Our pricing includes name reservation, filing fee, document drafting, certificate issuance, and TIN generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Package 1: Business Name */}
            <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col justify-between hover:border-primary transition">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Sole Proprietorship / Partnership
                </span>
                <h3 className="text-xl font-bold text-dark dark:text-white mt-1">
                  Business Name (Enterprise)
                </h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white">
                    ₦22,000
                  </span>
                  <span className="text-xs text-body-color block mt-1">Turnaround: 5–7 Working Days</span>
                </div>

                <ul className="space-y-3 text-xs text-body-color">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>2 Proposed Names Reservation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official CAC Certificate (Digital BN)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Certified CAC Status Report</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Federal Inland Revenue (FIRS) TIN</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Corporate Bank Account Opening Ready</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard/cac"
                className="mt-8 block text-center w-full py-3 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition"
              >
                Register Business Name
              </Link>
            </div>

            {/* Package 2: Private Limited Company (Featured) */}
            <div className="p-8 rounded-3xl bg-white dark:bg-dark border-2 border-primary shadow-xl shadow-primary/10 flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                Most Popular
              </span>

              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Incorporated Entity
                </span>
                <h3 className="text-xl font-bold text-dark dark:text-white mt-1">
                  Private Limited Company (LTD)
                </h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white">
                    ₦55,000
                  </span>
                  <span className="text-xs text-body-color block mt-1">Turnaround: 7–10 Working Days</span>
                </div>

                <ul className="space-y-3 text-xs text-body-color">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 Million Share Capital Filing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Memorandum & Articles (MEMART)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official Certificate of Incorporation (RC)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full CAC Status Report & Directors Schedule</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tax Identification Number (TIN)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standard Company Seal Support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard/cac"
                className="mt-8 block text-center w-full py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-md shadow-primary/20"
              >
                Incorporate LTD Company
              </Link>
            </div>

            {/* Package 3: NGO / Foundation */}
            <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col justify-between hover:border-primary transition">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Non-Profit / Association
                </span>
                <h3 className="text-xl font-bold text-dark dark:text-white mt-1">
                  Incorporated Trustees (IT/NGO)
                </h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white">
                    ₦110,000
                  </span>
                  <span className="text-xs text-body-color block mt-1">Turnaround: 3–4 Weeks (Newspaper Ads)</span>
                </div>

                <ul className="space-y-3 text-xs text-body-color">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Trustees Constitution Drafting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>2 National Newspaper Publications Included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official CAC Incorporation Certificate (IT)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Trustee Status Report & Certified Copy</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard/cac"
                className="mt-8 block text-center w-full py-3 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition"
              >
                Register NGO / Trustees
              </Link>
            </div>
          </div>
        </div>

        {/* 4-Step Filing Roadmap */}
        <div className="mb-16 p-8 sm:p-10 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <h3 className="text-xl font-bold text-dark dark:text-white mb-6">
            How The CAC Registration Process Works
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center mb-3">
                1
              </span>
              <h4 className="text-sm font-bold text-dark dark:text-white">Name Search</h4>
              <p className="text-xs text-body-color mt-1">
                You submit 2 proposed names. We perform a preliminary availability search and reserve the name with CAC.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center mb-3">
                2
              </span>
              <h4 className="text-sm font-bold text-dark dark:text-white">KYC Verification</h4>
              <p className="text-xs text-body-color mt-1">
                Upload proprietor/directors valid government ID (NIN/Voters/Passport), signature specimen, and business address.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center mb-3">
                3
              </span>
              <h4 className="text-sm font-bold text-dark dark:text-white">Portal Filing</h4>
              <p className="text-xs text-body-color mt-1">
                We prepare MEMART/Proprietorship schedules, remit all statutory stamp duties, and track processing with CAC officers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark">
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                4
              </span>
              <h4 className="text-sm font-bold text-dark dark:text-white">Delivery & TIN</h4>
              <p className="text-xs text-body-color mt-1">
                Receive your official Certificate with verifiable QR code, Status Report, and automated FIRS Tax Identification Number.
              </p>
            </div>
          </div>
        </div>

        {/* Live Status Tracker */}
        <div id="tracker" className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm max-w-2xl mx-auto">
          <div className="text-center max-w-md mx-auto mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-dark dark:text-white">
              Track Your CAC Corporate Filing
            </h3>
            <p className="text-xs text-body-color mt-1">
              Enter your tracking reference (e.g. HT-CAC-2026-4402) to inspect current commission portal status.
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={trackRef}
              onChange={(e) => setTrackRef(e.target.value)}
              placeholder="e.g. HT-CAC-2026-4402"
              className="flex-1 px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-xs sm:text-sm focus:outline-none focus:border-primary uppercase font-mono"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              Track Filing
            </button>
          </form>

          {trackResult && (
            <div className="mt-6 p-5 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark text-xs animate-in fade-in duration-200">
              {trackResult.found ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-dark dark:text-white text-sm">
                      {trackResult.reference}
                    </span>
                    <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {trackResult.status}
                    </span>
                  </div>
                  <p className="text-body-color">Proposed Name: <strong className="text-dark dark:text-white">{trackResult.proposedName}</strong></p>
                  <p className="text-body-color">{trackResult.notes}</p>
                </div>
              ) : (
                <p className="text-red-600 dark:text-red-400 text-center">{trackResult.notes}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
