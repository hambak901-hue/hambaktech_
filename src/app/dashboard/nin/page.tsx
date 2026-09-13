"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  FileCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { NINRequest } from "@/types/platform";
import companyConfig from "@/data/companyConfig";

const NIN_SERVICES = [
  { id: "PLASTIC_CARD", title: "Plastic PVC ID Card Printing", price: 2500, time: "Same Day / 24 Hours" },
  { id: "SLIP_RETRIEVAL", title: "NIN Slip Retrieval & Color Reprint", price: 1500, time: "Instant (15 mins)" },
  { id: "MODIFICATION_GUIDANCE", title: "Data Modification Guidance (DOB/Name)", price: 3000, time: "24-48 Hours" },
  { id: "HARMONIZATION_CHECK", title: "BVN - NIN Harmonization Pre-check", price: 1000, time: "Immediate" },
];

export default function DashboardNINPage() {
  const [requests, setRequests] = useState<NINRequest[]>(platformApi.getNINRequests());
  const [showNewModal, setShowNewModal] = useState(false);
  const [serviceType, setServiceType] = useState<any>("PLASTIC_CARD");
  const [applicantName, setApplicantName] = useState("");
  const [ninNumber, setNinNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"PICKUP" | "COURIER">("PICKUP");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(platformApi.getWallet());

  const selectedService = NIN_SERVICES.find((s) => s.id === serviceType) || NIN_SERVICES[0];

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !phone) {
      alert("Please enter applicant name and phone number");
      return;
    }
    if (wallet.currentBalance < selectedService.price) {
      alert("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const created = platformApi.createNINRequest({
          serviceType,
          applicantName,
          ninNumber: ninNumber || undefined,
          phone,
          deliveryType,
          notes,
          amount: selectedService.price,
        });

        setRequests(platformApi.getNINRequests());
        setWallet(platformApi.getWallet());
        setLoading(false);
        setShowNewModal(false);
        setApplicantName("");
        setNinNumber("");
        setPhone("");
        setNotes("");
        alert(`NIN Service Request submitted! Reference: ${created.referenceNumber}`);
      } catch (err: any) {
        setLoading(false);
        alert(err.message || "Failed to submit NIN request");
      }
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY_FOR_PICKUP":
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200";
      case "PENDING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
    }
  };

  return (
    <DashboardLayout
      pageTitle="NIN Centre & Identity Assistance Desk"
      breadcrumbs={[{ label: "NIN Desk" }]}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Ibeju-Lekki Hub Identity Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              NIN Requests & Card Production
            </h2>
            <p className="text-xs sm:text-sm text-body-color mt-1 max-w-xl">
              Track plastic PVC card printings, slip reprints, and harmonization reviews. Physical pickup available at Origanrigan Cele Area desk.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary/90 transition shadow-md shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              <span>New NIN Request</span>
            </button>
          </div>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Legal Disclaimer:</strong> HambakTech is an independent business centre providing documentation, technical assistance, and plastic ID printing. We are not NIMC and do not issue official statutory identity numbers.
          </span>
        </div>

        {/* Active Requests List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <h3 className="text-base font-bold text-dark dark:text-white mb-4">
            Your NIN Service Applications ({requests.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                  <th className="pb-3 font-semibold">Reference</th>
                  <th className="pb-3 font-semibold">Applicant Name</th>
                  <th className="pb-3 font-semibold">Service Type</th>
                  <th className="pb-3 font-semibold">Delivery Mode</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Operational Notes</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/40">
                    <td className="py-3.5 font-mono font-bold text-primary dark:text-primary">
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
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-dark text-[10px] font-medium text-body-color">
                        {req.deliveryType}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {req.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 text-body-color max-w-xs truncate">
                      {req.notes || "Processing through verification channels"}
                    </td>
                    <td className="py-3.5 text-right text-body-color">
                      {new Date(req.createdAt || req.submittedAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: New NIN Request */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                    Submit New NIN Service Request
                  </h3>
                  <p className="text-xs text-body-color">
                    Debit from HambakTech Wallet: ₦{selectedService.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color"
                >
                  ✕
                </button>
              </div>

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
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          serviceType === s.id
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="ninService"
                            value={s.id}
                            checked={serviceType === s.id}
                            onChange={() => setServiceType(s.id)}
                          />
                          <div>
                            <p className="font-bold text-dark dark:text-white">{s.title}</p>
                            <span className="text-[10px] text-body-color">Est: {s.time}</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-primary">₦{s.price.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Applicant Name */}
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Full Legal Name (as registered)
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Surname First, Middle, Other names"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                {/* NIN / Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      NIN Number (If known)
                    </label>
                    <input
                      type="text"
                      value={ninNumber}
                      onChange={(e) => setNinNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                      placeholder="11-digit NIN"
                      className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Phone Number
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
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                        deliveryType === "PICKUP"
                          ? "bg-primary text-white border-primary"
                          : "border-stroke dark:border-strokedark text-body-color"
                      }`}
                    >
                      Physical Pickup (Ibeju Hub)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("COURIER")}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                        deliveryType === "COURIER"
                          ? "bg-primary text-white border-primary"
                          : "border-stroke dark:border-strokedark text-body-color"
                      }`}
                    >
                      Courier Delivery
                    </button>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Special Instructions / Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Please inform me as soon as the plastic card is laminated."
                    className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-stroke dark:border-strokedark flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold text-dark dark:text-white hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <span>Submit & Pay ₦{selectedService.price.toLocaleString()}</span>
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
