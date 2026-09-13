"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  FileCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  HelpCircle,
  Users,
  Baby,
} from "lucide-react";
import platformApi from "@/lib/api-client";
import companyConfig from "@/data/companyConfig";

export default function NINCentrePublicPage() {
  const [trackRef, setTrackRef] = useState("");
  const [trackResult, setTrackResult] = useState<{
    found: boolean;
    reference?: string;
    serviceType?: string;
    status?: string;
    notes?: string;
  } | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRef.trim()) return;

    const res = platformApi.trackNINRequest(trackRef.trim());
    if (res) {
      setTrackResult({
        found: true,
        reference: res.referenceNumber,
        serviceType: res.serviceType.replace(/_/g, " "),
        status: res.status,
        notes: res.notes,
      });
    } else {
      setTrackResult({
        found: false,
        notes: `No active NIN application found for reference "${trackRef}". Please check your receipt.`,
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
          <span className="text-dark dark:text-white font-medium">NIN Support Desk</span>
        </div>

        {/* Hero Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent National Identity Desk & Business Support</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-dark dark:text-white">
              NIN Services, Retrieval & Plastic Card Desk
            </h1>
            <p className="mt-4 text-sm sm:text-base text-body-color dark:text-body-color-dark leading-relaxed">
              Serving residents, students, and businesses along the Lekki–Epe corridor in Ibeju-Lekki. We offer verified pre-enrollment document preparation, NIN slip reprint, heavy-duty smart PVC ID card printing, and data modification guidance.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard/nin"
                className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-md shadow-primary/25 inline-flex items-center gap-2"
              >
                <span>Launch Dashboard NIN Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#tracker"
                className="px-6 py-3 rounded-2xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-dark transition inline-flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-primary" />
                <span>Track Existing Request</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mandatory Regulatory & Legal Compliance Disclaimer */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 mb-12 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Important Regulatory Notice & Disclaimer
            </strong>
            <p className="leading-relaxed">
              HambakTech & Services is an independent technology centre and private documentation assistance desk. We are not NIMC (National Identity Management Commission) and do not directly generate or re-issue statutory identity numbers. All biometric capture and final database modifications are conducted in strict accordance with statutory NIMC guidelines and official enrolment infrastructure.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-white mb-6">
            Available Identity Assistance Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-dark dark:text-white">
                  Plastic PVC ID Card
                </h3>
                <p className="text-xs text-body-color mt-2 leading-relaxed">
                  Convert your standard paper NIN slip into a durable, waterproof, high-definition thermal plastic PVC card with verified QR code.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stroke/60 dark:border-strokedark/60 flex items-center justify-between text-xs">
                <span className="font-bold text-primary">₦2,500</span>
                <span className="text-body-color">Same Day / 24hrs</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-4">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-dark dark:text-white">
                  Slip Retrieval & Reprint
                </h3>
                <p className="text-xs text-body-color mt-2 leading-relaxed">
                  Lost your NIN slip? We assist with verified digital retrieval and color laser printing on high-density 120gsm bond stock.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stroke/60 dark:border-strokedark/60 flex items-center justify-between text-xs">
                <span className="font-bold text-primary">₦1,500</span>
                <span className="text-body-color">Instant (15 mins)</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-4">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-dark dark:text-white">
                  Modification Guidance
                </h3>
                <p className="text-xs text-body-color mt-2 leading-relaxed">
                  Step-by-step document review for Name Corrections, Date of Birth updates (with court affidavit / NPC cert), and Phone Number linkage.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stroke/60 dark:border-strokedark/60 flex items-center justify-between text-xs">
                <span className="font-bold text-primary">Consult Desk</span>
                <span className="text-body-color">Full Audit</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-dark dark:text-white">
                  BVN Harmonization Check
                </h3>
                <p className="text-xs text-body-color mt-2 leading-relaxed">
                  Verify name matching, date consistency, and phone alignments between your bank BVN records and national identity records before official submission.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stroke/60 dark:border-strokedark/60 flex items-center justify-between text-xs">
                <span className="font-bold text-primary">₦1,000</span>
                <span className="text-body-color">Pre-check</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Checklist (Adults vs Minors) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-dark dark:text-white">
                Adult Enrolment Checklist (16+ yrs)
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-body-color">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Original Birth Certificate OR National Population Commission (NPC) Attestation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Valid Government-issued photo ID (Voter&apos;s Card, Driver&apos;s License, or Int&apos;l Passport)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Bank Verification Number (BVN) printout if registered</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Current Residential Utility Bill (EKEDC / IKEDC) for address verification</span>
              </li>
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <Baby className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-dark dark:text-white">
                Child / Minor Enrolment Checklist (0–15 yrs)
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-body-color">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Child&apos;s Original Birth Certificate from National Population Commission</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Parent or Legal Guardian&apos;s verified National Identity Number (NIN) Slip</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Physical presence of parent or legal guardian for parental consent sign-off</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Recent passport photograph of the minor</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Live Tracking Section */}
        <div id="tracker" className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm max-w-2xl mx-auto">
          <div className="text-center max-w-md mx-auto mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-dark dark:text-white">
              Track Your NIN Service Request
            </h3>
            <p className="text-xs text-body-color mt-1">
              Enter the tracking code provided on your printed HambakTech receipt (e.g., HT-NIN-2026-8812)
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={trackRef}
              onChange={(e) => setTrackRef(e.target.value)}
              placeholder="e.g. HT-NIN-2026-8812"
              className="flex-1 px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-xs sm:text-sm focus:outline-none focus:border-primary uppercase font-mono"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              Verify Status
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
                  <p className="text-body-color">Service: <strong className="text-dark dark:text-white">{trackResult.serviceType}</strong></p>
                  <p className="text-body-color">{trackResult.notes}</p>
                </div>
              ) : (
                <p className="text-red-600 dark:text-red-400 text-center">{trackResult.notes}</p>
              )}
            </div>
          )}
        </div>

        {/* Physical Office Hub */}
        <div className="mt-16 p-8 rounded-3xl bg-gray-100 dark:bg-gray-dark flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Physical Walk-In Assistance
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-dark dark:text-white mt-1">
              Visit Our Ibeju-Lekki Technology Hub
            </h3>
            <p className="text-xs sm:text-sm text-body-color mt-1">
              {companyConfig.address} • Hours: {companyConfig.operatingHours}
            </p>
          </div>
          <a
            href={`https://wa.me/234${companyConfig.whatsapp.slice(1)}?text=Hello%20HambakTech,%20I%20need%20assistance%20with%20NIN%20services`}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shrink-0"
          >
            Chat with Desk on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
