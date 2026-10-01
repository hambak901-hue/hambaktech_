"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  FileCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Wallet,
  Lock,
  Building,
  Truck,
  MapPin,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { NINRequest } from "@/types/platform";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

interface NINServiceOption {
  id: string;
  title: string;
  price: number;
  time: string;
  description: string;
  ninRequired: boolean;
}

const NIN_SERVICES: NINServiceOption[] = [
  {
    id: "PLASTIC_CARD",
    title: "Plastic PVC ID Card Printing",
    price: 2500,
    time: "Same Day / 24 Hours",
    description: "Heavy-duty waterproof PVC plastic card with secure laminate and standard QR code.",
    ninRequired: true,
  },
  {
    id: "SLIP_RETRIEVAL",
    title: "NIN Slip Retrieval & Color Reprint",
    price: 1500,
    time: "Instant (15 mins)",
    description: "Official color premium NIN slip retrieval and high-resolution lamination.",
    ninRequired: false,
  },
  {
    id: "MODIFICATION_GUIDANCE",
    title: "Data Modification Guidance (DOB/Name)",
    price: 3000,
    time: "24-48 Hours",
    description: "Document pre-check and compliance assistance for NIMC biometric data modification.",
    ninRequired: true,
  },
  {
    id: "HARMONIZATION_CHECK",
    title: "BVN - NIN Harmonization Pre-check",
    price: 1000,
    time: "Immediate",
    description: "Cross-system demographic alignment check between BVN records and NIMC database.",
    ninRequired: true,
  },
];

export default function DashboardNINPage() {
  const [requests, setRequests] = useState<NINRequest[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(true);

  // Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [serviceType, setServiceType] = useState<string>("PLASTIC_CARD");
  const [applicantName, setApplicantName] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [showNin, setShowNin] = useState(false);
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"PICKUP" | "COURIER">("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);

  // Form status state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastCreatedRef, setLastCreatedRef] = useState<string | null>(null);

  // Inspection modal
  const [selectedItem, setSelectedItem] = useState<NINRequest | null>(null);

  const selectedService = NIN_SERVICES.find((s) => s.id === serviceType) || NIN_SERVICES[0];

  const loadData = async () => {
    setIsFetching(true);
    try {
      const [reqRes, walRes] = await Promise.all([
        fetch(getApiUrl("/api/nin/requests"), {
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
      console.error("Failed to load NIN records:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form validation
    const cleanName = applicantName.trim();
    if (!cleanName || cleanName.length < 3) {
      setErrorMessage("Please enter the applicant's full legal name (minimum 3 characters).");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMessage("Please provide a valid 11-digit Nigerian contact phone number.");
      return;
    }

    const cleanNin = ninNumber.replace(/\D/g, "");
    if (selectedService.ninRequired) {
      if (!cleanNin || cleanNin.length !== 11) {
        setErrorMessage("This service requires a valid 11-digit National Identification Number (NIN).");
        return;
      }
    } else if (cleanNin && cleanNin.length !== 11) {
      setErrorMessage("If provided, NIN must be exactly 11 digits.");
      return;
    }

    if (deliveryType === "COURIER" && !deliveryAddress.trim()) {
      setErrorMessage("Please provide a complete destination address for courier delivery.");
      return;
    }

    if (!consent) {
      setErrorMessage("You must accept the NDPR data protection notice to proceed.");
      return;
    }

    if (walletBalance < selectedService.price) {
      setErrorMessage(
        `Insufficient digital wallet balance (₦${walletBalance.toLocaleString()}). Service fee is ₦${selectedService.price.toLocaleString()}. Please fund your wallet first.`
      );
      return;
    }

    // Submit to HambakTech Backend (never directly to external providers)
    setLoading(true);

    try {
      const fullNotes = deliveryType === "COURIER"
        ? `[COURIER DESTINATION: ${deliveryAddress.trim()}] ${notes.trim()}`
        : notes.trim();

      const res = await fetch(getApiUrl("/api/nin/requests"), {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          serviceType: selectedService.id,
          applicantName: cleanName,
          ninNumber: cleanNin || undefined,
          phone: cleanPhone,
          deliveryType,
          notes: fullNotes,
          consent: true,
          amount: selectedService.price,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error?.message || "Failed to submit NIN request.");
      }

      const created = json.data;
      setLastCreatedRef(created?.referenceNumber || null);
      setSuccessMessage(
        `NIN Service Request submitted successfully! Reference: ${created?.referenceNumber || "Submitted"}. Fee of ₦${selectedService.price.toLocaleString()} debited from wallet.`
      );

      // Reset form
      setApplicantName("");
      setNinNumber("");
      setPhone("");
      setNotes("");
      setDeliveryAddress("");
      setConsent(false);
      setShowNewModal(false);

      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
      case "VERIFIED":
        return "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20";
      case "PROCESSING":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20";
    }
  };

  return (
    <DashboardLayout
      pageTitle="NIN Centre & Identity Assistance Desk"
      breadcrumbs={[{ label: "Identity" }, { label: "NIN Operations Desk" }]}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>HambakTech Ibeju-Lekki Hub Identity Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              National Identification Services & PVC Card Desk
            </h2>
            <p className="text-xs sm:text-sm text-body-color mt-1 max-w-xl">
              Apply for plastic PVC ID card printing, premium slip color reprints, data modification guidance, and BVN harmonization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark text-right">
              <span className="text-[10px] text-body-color uppercase tracking-wider block">Wallet Balance</span>
              <strong className="text-sm font-bold text-dark dark:text-white">
                ₦{walletBalance.toLocaleString()}
              </strong>
            </div>

            <button
              onClick={() => {
                setErrorMessage(null);
                setShowNewModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary/90 transition shadow-md shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              <span>New NIN Request</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            {lastCreatedRef && (
              <span className="font-mono text-[11px] underline">Ref: {lastCreatedRef}</span>
            )}
          </div>
        )}

        {/* Regulatory Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Important Statutory Notice:</strong>
            <p>
              HambakTech & Services is an independent technology centre providing verified documentation, technical guidance, and PVC printing assistance. We are not NIMC and do not issue official statutory identity numbers.
            </p>
          </div>
        </div>

        {/* Active Applications List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-dark dark:text-white">
              Your NIN Service Applications ({requests.length})
            </h3>
            <button
              onClick={loadData}
              disabled={isFetching}
              className="p-1.5 rounded-lg text-body-color hover:text-dark dark:hover:text-white transition"
              title="Refresh requests"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-dark dark:text-white">No NIN Applications Yet</h4>
              <p className="text-xs text-body-color max-w-sm mx-auto">
                Submit an application for plastic PVC ID card printing or color slip retrieval using the button above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                    <th className="pb-3 font-semibold">Reference</th>
                    <th className="pb-3 font-semibold">Applicant Name</th>
                    <th className="pb-3 font-semibold">Service Type</th>
                    <th className="pb-3 font-semibold">Masked NIN</th>
                    <th className="pb-3 font-semibold">Delivery Mode</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/40">
                      <td className="py-3.5 font-mono font-bold text-primary">
                        {req.referenceNumber}
                      </td>
                      <td className="py-3.5 font-bold text-dark dark:text-white">
                        {req.applicantName}
                      </td>
                      <td className="py-3.5">
                        <span className="font-semibold text-dark dark:text-white">
                          {req.serviceType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-body-color">
                        {req.ninNumber || "Not Specified"}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-dark text-[10px] font-medium text-body-color">
                          {req.deliveryType || "PICKUP"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setSelectedItem(req)}
                          className="px-2.5 py-1 rounded-lg border border-stroke dark:border-strokedark text-[11px] font-semibold text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Details View */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary block">Application Details</span>
                  <h3 className="text-base font-bold text-dark dark:text-white font-mono">
                    {selectedItem.referenceNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-body-color block mb-0.5">Applicant</span>
                  <strong className="text-dark dark:text-white font-semibold">{selectedItem.applicantName}</strong>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5">Contact Phone</span>
                  <strong className="text-dark dark:text-white font-semibold">{selectedItem.phone || "On File"}</strong>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5">Service Requested</span>
                  <strong className="text-dark dark:text-white font-semibold">{selectedItem.serviceType.replace(/_/g, " ")}</strong>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5">Current Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedItem.status)}`}>
                    {selectedItem.status}
                  </span>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5">Fulfillment Mode</span>
                  <strong className="text-dark dark:text-white font-semibold">
                    {selectedItem.deliveryType === "COURIER" ? "Courier Dispatch" : "Office Pickup (Ibeju-Lekki Hub)"}
                  </strong>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5">Masked NIN</span>
                  <strong className="font-mono text-dark dark:text-white font-semibold">{selectedItem.ninNumber || "N/A"}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark text-xs space-y-1">
                <span className="text-body-color font-semibold block">Operational Notes & Remarks:</span>
                <p className="text-dark dark:text-white">
                  {selectedItem.notes || "Application queued in processing pipeline. For physical pickup, bring a valid payment reference slip to the Origanrigan Cele Area desk."}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: New NIN Request Form */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                    Submit New NIN Service Request
                  </h3>
                  <p className="text-xs text-body-color">
                    Direct authoritative debit from HambakTech Wallet: ₦{selectedService.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color"
                >
                  ✕
                </button>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Wallet Balance Warning */}
              {walletBalance < selectedService.price && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Balance: ₦{walletBalance.toLocaleString()}. Required: ₦{selectedService.price.toLocaleString()}.
                    </span>
                  </div>
                  <Link
                    href="/dashboard/wallet/fund"
                    className="font-bold text-primary underline shrink-0 hover:text-primary/80"
                  >
                    Fund Wallet
                  </Link>
                </div>
              )}

              <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
                {/* Service Picker */}
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                    Select Service Option
                  </label>
                  <div className="space-y-2">
                    {NIN_SERVICES.map((s) => (
                      <label
                        key={s.id}
                        className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition ${
                          serviceType === s.id
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="ninService"
                            value={s.id}
                            checked={serviceType === s.id}
                            onChange={() => setServiceType(s.id)}
                            className="mt-0.5"
                          />
                          <div>
                            <p className="font-bold text-dark dark:text-white">{s.title}</p>
                            <p className="text-[11px] text-body-color">{s.description}</p>
                            <span className="text-[10px] text-primary font-medium">Est. Completion: {s.time}</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-primary shrink-0 ml-3">
                          ₦{s.price.toLocaleString()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Applicant Legal Name */}
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Full Legal Name (as registered with NIMC)
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Surname First, Middle Name, Other Names"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                {/* NIN & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      NIN Number {selectedService.ninRequired ? "(Required)" : "(If Known)"}
                    </label>
                    <div className="relative">
                      <input
                        type={showNin ? "text" : "password"}
                        value={ninNumber}
                        onChange={(e) => setNinNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                        placeholder="11-digit NIN"
                        required={selectedService.ninRequired}
                        className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNin(!showNin)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-body-color hover:text-dark dark:hover:text-white"
                        title={showNin ? "Hide NIN" : "Show NIN"}
                      >
                        {showNin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="08147837664"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                {/* Delivery Mode */}
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                    Fulfillment Preference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("PICKUP")}
                      className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                        deliveryType === "PICKUP"
                          ? "bg-primary text-white border-primary"
                          : "border-stroke dark:border-strokedark text-body-color hover:bg-gray-50 dark:hover:bg-gray-dark"
                      }`}
                    >
                      <Building className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="block text-xs">Hub Pickup</span>
                        <span className="text-[10px] font-normal opacity-80">Origanrigan Cele Desk</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("COURIER")}
                      className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                        deliveryType === "COURIER"
                          ? "bg-primary text-white border-primary"
                          : "border-stroke dark:border-strokedark text-body-color hover:bg-gray-50 dark:hover:bg-gray-dark"
                      }`}
                    >
                      <Truck className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="block text-xs">Courier Dispatch</span>
                        <span className="text-[10px] font-normal opacity-80">Lagos & Nationwide</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Courier Destination Address */}
                {deliveryType === "COURIER" && (
                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Courier Delivery Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={2}
                      placeholder="Street address, landmarks, town, LGA, state"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Special Instructions / Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Please notify me via WhatsApp when ready for pickup."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                {/* NDPR Privacy & Legal Consent */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark/50 border border-stroke dark:border-strokedark">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-[11px] text-body-color leading-relaxed">
                      I confirm that the information provided is accurate and authorize HambakTech to process my application under Nigerian Data Protection Regulation (NDPR) guidelines. Sensitive numbers are strictly masked and encrypted.
                    </span>
                  </label>
                </div>

                {/* Actions & Submit Button with Duplicate-Submit Defense */}
                <div className="pt-3 border-t border-stroke dark:border-strokedark flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark font-semibold text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || walletBalance < selectedService.price || !consent}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing Debit & Request...</span>
                      </>
                    ) : (
                      <span>Pay ₦{selectedService.price.toLocaleString()} & Submit</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
