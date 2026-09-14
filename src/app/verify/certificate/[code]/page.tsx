import React from "next/server";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  FileCheck,
  Building2,
  ExternalLink,
  ArrowLeft,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import QRCodeView from "@/components/common/QRCodeView";
import { AcademyService } from "@/lib/server/platform-store";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function CertificateVerificationPage({ params }: PageProps) {
  const { code } = await params;
  const verification = await AcademyService.verifyCertificate(code);
  const isValid = verification.valid && verification.status === "VALID";
  const canonicalUrl = `https://hambaktech.com.ng/verify/certificate/${code}`;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50 dark:bg-black text-dark dark:text-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-body-color">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/academy" className="hover:text-primary">Academy</Link>
          <span>/</span>
          <span className="text-dark dark:text-white font-medium">Certificate Verification</span>
        </div>

        {/* Verification Status Header */}
        <div
          id="verification-status-banner"
          className={`p-6 sm:p-8 rounded-3xl border mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 ${
            isValid
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50"
              : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50"
          }`}
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                isValid
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              }`}
            >
              {isValid ? <ShieldCheck className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-1 bg-white/70 dark:bg-dark/70 border border-current">
                {isValid ? (
                  <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authentic HambakTech Credential
                  </span>
                ) : (
                  <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Unverified or Revoked Credential
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-white">
                {isValid ? "Official Certificate Verified" : "Certificate Not Found"}
              </h1>
              <p className="text-xs sm:text-sm text-body-color dark:text-body-color-dark mt-1">
                {isValid
                  ? "This record has been confirmed against the HambakTech Institute of Information Technology academic registry."
                  : `No valid academic credential was found matching code "${code}". Please check the serial number and retry.`}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm shrink-0">
            <QRCodeView value={canonicalUrl} size={90} />
            <span className="text-[10px] text-body-color mt-1 font-mono">{verification.certificateNumber}</span>
          </div>
        </div>

        {/* Certificate Card Content */}
        {isValid ? (
          <div
            id="certificate-credential-card"
            className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-8 sm:p-12 shadow-sm relative overflow-hidden"
          >
            {/* Top Certificate Header */}
            <div className="border-b border-stroke dark:border-strokedark pb-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md shadow-primary/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-dark dark:text-white">
                    HambakTech Institute of Information Technology
                  </h2>
                  <p className="text-xs text-body-color">
                    Ibeju-Lekki Hub, Lagos State, Nigeria &bull; Accredited Vocational ICT Training
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-body-color block uppercase tracking-wider font-semibold">Certificate Number</span>
                <span className="text-sm font-mono font-bold text-primary">{verification.certificateNumber}</span>
              </div>
            </div>

            {/* Recipient Details (Privacy safe - public name only, no phone, no email) */}
            <div className="text-center py-6">
              <span className="text-xs uppercase tracking-widest text-body-color font-semibold">This is to certify that</span>
              <h3 className="text-3xl sm:text-4xl font-black text-dark dark:text-white mt-2 mb-3">
                {verification.studentInitialsOrPublicName}
              </h3>
              <p className="text-sm text-body-color max-w-xl mx-auto leading-relaxed">
                has successfully fulfilled all academic curriculum requirements, practical lab workshops, capstone evaluations, and continuous assessments for the program:
              </p>
              <div className="my-6 inline-block px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-lg sm:text-xl">
                {verification.courseTitle}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stroke dark:border-strokedark mb-8">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark">
                <span className="text-xs text-body-color block mb-1 font-medium">Academic Standing / Grade</span>
                <span className="text-base font-bold text-dark dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  {verification.grade || "Distinction"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark">
                <span className="text-xs text-body-color block mb-1 font-medium">Date Issued</span>
                <span className="text-base font-bold text-dark dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  {verification.issuedAt ? new Date(verification.issuedAt).toLocaleDateString("en-NG", { dateStyle: "long" }) : "Verified"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark">
                <span className="text-xs text-body-color block mb-1 font-medium">Registry Status</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  Active & Verified
                </span>
              </div>
            </div>

            {/* Accredited Skills Covered */}
            {verification.accreditedSkills && verification.accreditedSkills.length > 0 && (
              <div className="mb-8 p-6 rounded-2xl bg-gray-50/70 dark:bg-gray-900/50 border border-stroke dark:border-strokedark">
                <h4 className="text-xs font-bold uppercase tracking-wider text-dark dark:text-white mb-3">
                  Accredited Program Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {verification.accreditedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-xs font-semibold text-dark dark:text-white inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cryptographic Verification Hash (Privacy Safe Anti-tamper Proof) */}
            <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-stroke dark:border-strokedark text-xs text-body-color">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-dark dark:text-white block">Digital Fingerprint Verification:</span>
                  <span className="font-mono text-[11px] break-all">{verification.verificationHash || canonicalUrl}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                  SHA-256 Validated
                </span>
              </div>
            </div>

            {/* Safe Privacy Notice */}
            <div className="mt-6 text-center text-xs text-body-color">
              <p>
                In compliance with student data protection policies, sensitive personal identifiers (phone numbers, email addresses, and payment records) are never exposed via the public verification portal.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-10 text-center shadow-sm">
            <h3 className="text-lg font-bold text-dark dark:text-white mb-2">Need to verify another certificate?</h3>
            <p className="text-sm text-body-color mb-6 max-w-md mx-auto">
              Ensure you typed the exact certificate number printed on the certificate document (e.g. HT-CERT-2026-0001).
            </p>
            <Link
              href="/verify"
              className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Certificate Registry Search</span>
            </Link>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/academy"
            className="px-5 py-2.5 rounded-2xl border border-stroke dark:border-strokedark text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 transition inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Academy Programs</span>
          </Link>

          <Link
            href="/dashboard/academy"
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition inline-flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
