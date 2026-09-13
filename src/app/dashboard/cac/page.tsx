"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Search,
  Download,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { CACRequest } from "@/types/platform";

const CAC_SERVICES = [
  {
    id: "BUSINESS_NAME",
    name: "Business Name (Sole Proprietorship / Enterprise)",
    price: 22000,
    time: "5–7 Working Days",
  },
  {
    id: "LIMITED_COMPANY",
    name: "Private Limited Liability Company (LTD)",
    price: 55000,
    time: "7–10 Working Days",
  },
  {
    id: "INCORPORATED_TRUSTEES",
    name: "Incorporated Trustees / Non-Profit (NGO)",
    price: 110000,
    time: "3–4 Weeks",
  },
];

export default function DashboardCACPage() {
  const [filings, setFilings] = useState<CACRequest[]>(platformApi.getCACRequests());
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [regType, setRegType] = useState<any>("BUSINESS_NAME");
  const [proposedName1, setProposedName1] = useState("");
  const [proposedName2, setProposedName2] = useState("");
  const [businessNature, setBusinessNature] = useState("");
  const [proprietorName, setProprietorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(platformApi.getWallet());

  const selectedService = CAC_SERVICES.find((s) => s.id === regType) || CAC_SERVICES[0];

  const handleSubmitFiling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedName1 || !businessNature || !proprietorName || !phone) {
      alert("Please complete all required fields");
      return;
    }
    if (wallet.currentBalance < selectedService.price) {
      alert("Insufficient wallet balance. Please fund your wallet to proceed.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const created = platformApi.createCACRequest({
          registrationType: regType,
          proposedName1,
          proposedName2: proposedName2 || undefined,
          natureOfBusiness: businessNature,
          proprietorName,
          proprietorPhone: phone,
          proprietorEmail: email,
          businessAddress: address,
          amount: selectedService.price,
        });

        setFilings(platformApi.getCACRequests());
        setWallet(platformApi.getWallet());
        setLoading(false);
        setShowModal(false);
        setStep(1);
        setProposedName1("");
        setProposedName2("");
        setBusinessNature("");
        alert(`CAC Application Submitted! Your tracking reference is: ${created.referenceNumber}`);
      } catch (err: any) {
        setLoading(false);
        alert(err.message || "Failed to submit CAC application");
      }
    }, 1200);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED_CERTIFICATE_READY":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200";
      case "NAME_RESERVATION":
      case "DOCUMENT_VERIFICATION":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
    }
  };

  return (
    <DashboardLayout
      pageTitle="CAC Corporate Business Registration Desk"
      breadcrumbs={[{ label: "CAC Desk" }]}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 text-xs font-bold mb-2">
              <Building2 className="w-4 h-4" />
              <span>Corporate Affairs Commission (CAC) Support</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              Business Registration Filings
            </h2>
            <p className="text-xs sm:text-sm text-body-color mt-1 max-w-xl">
              Track name reservation approvals, status reports, and certificate downloads with Tax Identification Number (TIN).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowModal(true);
                setStep(1);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary/90 transition shadow-md shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              <span>New CAC Registration</span>
            </button>
          </div>
        </div>

        {/* Filings Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <h3 className="text-base font-bold text-dark dark:text-white mb-4">
            Active Filings & Registered Entities ({filings.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                  <th className="pb-3 font-semibold">Reference</th>
                  <th className="pb-3 font-semibold">Entity Name</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Commission Status</th>
                  <th className="pb-3 font-semibold">RC / BN Number</th>
                  <th className="pb-3 font-semibold">FIRS TIN</th>
                  <th className="pb-3 font-semibold text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {filings.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/40">
                    <td className="py-3.5 font-mono font-bold text-primary dark:text-primary">
                      {f.referenceNumber}
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-dark dark:text-white">{f.proposedName1}</p>
                      <span className="text-[10px] text-body-color">{f.natureOfBusiness}</span>
                    </td>
                    <td className="py-3.5 font-medium text-body-color">
                      {(f.registrationType || f.entityType || "").replace(/_/g, " ")}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          f.status
                        )}`}
                      >
                        {f.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-dark dark:text-white">
                      {f.rcNumber || "Pending Approval"}
                    </td>
                    <td className="py-3.5 font-mono text-body-color">
                      {f.tinNumber || "Automated at Issuance"}
                    </td>
                    <td className="py-3.5 text-right">
                      {f.status === "APPROVED_CERTIFICATE_READY" ? (
                        <button
                          onClick={() => alert(`Downloading CAC Certificate for ${f.proposedName1}`)}
                          className="inline-flex items-center gap-1 font-bold text-xs text-primary hover:underline"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-body-color">In Progress</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Step New Application Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                    Register Entity with CAC
                  </h3>
                  <p className="text-xs text-body-color">
                    Step {step} of 3 • HambakTech Corporate Filing Desk
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color"
                >
                  ✕
                </button>
              </div>

              {step === 1 && (
                <div className="space-y-4 text-xs">
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider">
                    Select Corporate Registration Type
                  </label>
                  <div className="space-y-2.5">
                    {CAC_SERVICES.map((s) => (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                          regType === s.id
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="regType"
                            value={s.id}
                            checked={regType === s.id}
                            onChange={() => setRegType(s.id)}
                          />
                          <div>
                            <p className="font-bold text-dark dark:text-white">{s.name}</p>
                            <span className="text-[10px] text-body-color">Turnaround: {s.time}</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-primary">₦{s.price.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stroke dark:border-strokedark flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition flex items-center gap-1.5"
                    >
                      <span>Continue to Names</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Proposed Business Name (Option 1) *
                    </label>
                    <input
                      type="text"
                      value={proposedName1}
                      onChange={(e) => setProposedName1(e.target.value)}
                      placeholder="e.g. ADEBAYO INTEGRATED AGRO SERVICES"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white uppercase focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Alternative Proposed Name (Option 2 - if Option 1 is taken)
                    </label>
                    <input
                      type="text"
                      value={proposedName2}
                      onChange={(e) => setProposedName2(e.target.value)}
                      placeholder="e.g. ADEBAYO GLOBAL FARMS"
                      className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white uppercase focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Nature & Objectives of Business *
                    </label>
                    <textarea
                      value={businessNature}
                      onChange={(e) => setBusinessNature(e.target.value)}
                      rows={3}
                      placeholder="Describe what the company or enterprise will do (e.g., General merchandise, IT consultancy, agricultural production...)"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="pt-3 border-t border-stroke dark:border-strokedark flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold text-dark dark:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!proposedName1 || !businessNature}
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <span>Continue to Proprietor Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <form onSubmit={handleSubmitFiling} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Proprietor / Director Full Legal Name *
                    </label>
                    <input
                      type="text"
                      value={proprietorName}
                      onChange={(e) => setProprietorName(e.target.value)}
                      placeholder="Surname First, Middle, Other names"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                        placeholder="0814..."
                        required
                        className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="director@example.com"
                        required
                        className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Physical Business Address *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 15 Commercial Avenue, Origanrigan Cele, Lagos"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Summary Box */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark space-y-1">
                    <div className="flex justify-between">
                      <span className="text-body-color">Package:</span>
                      <strong className="text-dark dark:text-white">{selectedService.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-color">Total Official Fee:</span>
                      <strong className="text-primary font-bold">₦{selectedService.price.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stroke dark:border-strokedark flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold text-dark dark:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-md shadow-primary/20 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Filing Application...</span>
                        </>
                      ) : (
                        <span>Confirm & Pay ₦{selectedService.price.toLocaleString()}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
