"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Wallet,
  Lock,
  Eye,
  EyeOff,
  Building2,
  FileCheck,
  Info,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Jaiz Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Moniepoint Microfinance Bank",
  "OPay (PayCom)",
  "Optimus Bank",
  "Palmpay",
  "Parallex Bank",
  "Polaris Bank",
  "PremiumTrust Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

interface BVNRequestRecord {
  id: string;
  referenceNumber: string;
  serviceType: string;
  fullName: string;
  bankName: string;
  bvnLast4: string;
  maskedBvn: string;
  phone: string;
  status: "PENDING" | "PROCESSING" | "VERIFIED" | "COMPLETED" | "REJECTED";
  amount: number;
  createdAt: string;
}

export default function DashboardBVNPage() {
  const [requests, setRequests] = useState<BVNRequestRecord[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [bankName, setBankName] = useState("Moniepoint Microfinance Bank");
  const [bvn, setBvn] = useState("");
  const [showBvn, setShowBvn] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  const HARMONIZATION_PRICE = 1000;

  const loadData = async () => {
    setIsFetching(true);
    try {
      const [reqRes, walRes] = await Promise.all([
        fetch(getApiUrl("/api/bvn/requests"), {
          headers: getAuthHeaders(),
          credentials: "include",
        }),
        fetch(getApiUrl("/api/wallet"), {
          headers: getAuthHeaders(),
          credentials: "include",
        }),
      ]);

      if (reqRes.ok) {
        const rJson = await reqRes.json();
        if (rJson.success && Array.isArray(rJson.data)) {
          setRequests(rJson.data);
        }
      }

      if (walRes.ok) {
        const wJson = await walRes.json();
        const walData = wJson.data?.wallet ?? wJson.data;
        if (wJson.success && walData) {
          setWalletBalance(Number(walData.currentBalance ?? walData.balance ?? 0));
        }
      }
    } catch (err) {
      console.warn("Error loading BVN data:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Strict Client Validation
    if (!fullName.trim() || !bankName.trim() || !phone.trim()) {
      setErrorMessage("Please complete all required identity and contact fields.");
      return;
    }

    const cleanBvn = bvn.replace(/\D/g, "");
    if (cleanBvn.length !== 11) {
      setErrorMessage("Bank Verification Number (BVN) must be strictly 11 numeric digits.");
      return;
    }

    if (!consent) {
      setErrorMessage("You must consent to NDPR identity verification before proceeding.");
      return;
    }

    if (walletBalance < HARMONIZATION_PRICE) {
      setErrorMessage(
        `Insufficient wallet balance (₦${walletBalance.toLocaleString()}). Pre-check fee is ₦${HARMONIZATION_PRICE.toLocaleString()}. Please fund your wallet first.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(getApiUrl("/api/bvn/requests"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: fullName.trim(),
          bankName: bankName.trim(),
          bvn: cleanBvn,
          dateOfBirth,
          phone: phone.trim(),
          consent: true,
          serviceType: "HARMONIZATION_CHECK",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || "Failed to submit BVN verification request.");
      }

      const created = json.data;
      setSuccessMessage(`BVN Harmonization pre-check submitted successfully. Reference: ${created.referenceNumber}`);
      setBvn("");
      setFullName("");
      setPhone("");
      setDateOfBirth("");
      setConsent(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      pageTitle="BVN Harmonization & Verification Desk"
      breadcrumbs={[
        { label: "Identity", href: "/dashboard/nin" },
        { label: "BVN Verification" },
      ]}
    >
      <div className="space-y-8">
        {/* Top Info Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-dark to-dark/95 text-white shadow-xl relative overflow-hidden border border-stroke/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Certified NDPR Compliance Desk</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Bank Verification Number (BVN) Pre-check & Alignment
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl">
                Verify consistency of names, date of birth, and telephone numbers across your BVN bank records and
                National Identity Number (NIMC) database to prevent banking restrictions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md text-right">
                <span className="text-[10px] text-white/60 uppercase tracking-wider block">Wallet Balance</span>
                <strong className="text-sm font-bold text-white">₦{walletBalance.toLocaleString()}</strong>
              </div>
              <Link
                href="/dashboard/wallet/fund"
                className="px-4 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition"
              >
                Fund Wallet
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Form Column */}
          <div className="lg:col-span-2">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">New Harmonization Verification</h3>
                  <p className="text-xs text-body-color">Fee: ₦{HARMONIZATION_PRICE.toLocaleString()} per verification check</p>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                    Full Legal Name (as registered with your bank) *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Babatunde Ibrahim Adeleke"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                    Primary Bank *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-xs font-medium focus:outline-none focus:border-primary"
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* BVN Input with live masking */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider">
                      11-Digit Bank Verification Number (BVN) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBvn(!showBvn)}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {showBvn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showBvn ? "Mask Digits" : "Show Digits"}</span>
                    </button>
                  </div>
                  <input
                    type={showBvn ? "text" : "password"}
                    maxLength={11}
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 11-digit BVN"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono text-sm tracking-widest focus:outline-none focus:border-primary"
                  />
                  <p className="text-[11px] text-body-color mt-1">
                    Digits: {bvn.length}/11 {bvn.length === 11 ? "✓ Complete" : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                      Phone Number linked to BVN *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 08147837664"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark text-xs space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-body-color text-[11px] leading-relaxed">
                      I explicitly authorize HambakTech & Services to verify my identity and banking records for data
                      harmonization. I understand that only masked references are stored in accordance with the Nigeria
                      Data Protection Act 2023.
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || bvn.length !== 11 || !consent || walletBalance < HARMONIZATION_PRICE}
                  className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/25 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authorizing ₦{HARMONIZATION_PRICE} & Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Pay ₦{HARMONIZATION_PRICE.toLocaleString()} from Wallet & Submit</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Side Info Column: Security & Recent History */}
          <div className="space-y-6">
            {/* Privacy & Security Highlights */}
            <div className="p-6 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-dark dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Data Protection Guarantees
              </h4>
              <ul className="text-xs text-body-color space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Zero full BVN persistence: Only the last 4 digits (e.g. ***1234) are stored.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Direct API validation through verified banking settlement switches.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Instant wallet debit with atomic ledger protection and reversal support.</span>
                </li>
              </ul>
            </div>

            {/* Recent Submissions */}
            <div className="p-6 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-dark dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Your Verification History
              </h4>

              {isFetching ? (
                <div className="p-4 text-center text-xs text-body-color flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading records...</span>
                </div>
              ) : requests.length === 0 ? (
                <p className="text-xs text-body-color italic text-center py-4">
                  No previous BVN harmonization requests found.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark text-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <strong className="font-mono text-dark dark:text-white">{req.referenceNumber}</strong>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                          {req.status}
                        </span>
                      </div>
                      <div className="text-body-color text-[11px] flex justify-between">
                        <span>Bank: {req.bankName}</span>
                        <span>BVN: {req.maskedBvn || `***${req.bvnLast4}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
