"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";
import { NINRequest, NINRequestStatus, NINServiceType } from "@/types/platform";

export default function AdminNINPage() {
  const [requests, setRequests] = useState<NINRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<NINRequest | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("COMPLETED");
  const [statusNote, setStatusNote] = useState("");
  const [processRefund, setProcessRefund] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [providerBalance, setProviderBalance] = useState<string | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  const checkVeripineBalance = async () => {
    setCheckingBalance(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/identity/provider-balance'), {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setProviderBalance('Unavailable (' + (data.message || 'Error') + ')');
      } else {
        const bal = data.data?.balance ?? data.data?.data?.balance ?? JSON.stringify(data.data);
        setProviderBalance('₦' + bal);
      }
    } catch (e: any) {
      setProviderBalance('Connection failed');
    } finally {
      setCheckingBalance(false);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl("/api/admin/nin"), {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        setRequests(
          list.map((r: any) => ({
            id: r.id,
            trackingNumber: r.tracking_id || r.trackingNumber || r.reference || r.id,
            applicantName: `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.applicantName || "Applicant",
            serviceType: (r.service_type || r.serviceType || "NIN_CARD") as NINServiceType,
            status: (r.status || "PENDING") as NINRequestStatus,
            ninNumber: r.nin_number || r.nin || r.ninNumber,
            phone: r.phone || r.user_phone,
            email: r.email || r.user_email,
            submittedAt: r.created_at || r.submittedAt || new Date().toISOString(),
            updatedAt: r.updated_at || r.updatedAt || new Date().toISOString(),
            deliveryType: (r.delivery_type || r.deliveryType || "PHYSICAL_PICKUP") as "DIGITAL_DOWNLOAD" | "PHYSICAL_PICKUP",
            pickupOffice: r.pickup_centre || r.pickupOffice || "HAMBakTECH Hub, Ibeju-Lekki",
            notes: r.notes || r.adminNotes,
          }))
        );
        setError(null);
      } else {
        setError("Failed to load NIN records from backend");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load NIN requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch(getApiUrl("/api/admin/nin"), {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedReq.id,
          status: newStatus,
          notes: statusNote,
          refund: newStatus === "REJECTED" && processRefund,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setSuccessMsg(
          `Request ${selectedReq.trackingNumber} status updated to ${newStatus}${
            json.data?.refund ? " (Refund credited to customer wallet)" : ""
          }`
        );
        setShowStatusModal(false);
        setStatusNote("");
        setProcessRefund(false);
        loadRequests();
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setActionError(json.message || "Failed to update status");
      }
    } catch {
      setActionError("Network error updating request status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<NINRequest>[] = [
    {
      key: "trackingNumber",
      header: "Tracking # & NIN",
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-bold text-dark dark:text-white block">
            {r.trackingNumber}
          </span>
          <span className="text-[11px] text-body-color font-mono">
            NIN: {r.ninNumber ? (r.ninNumber.includes("***") ? r.ninNumber : `***${r.ninNumber.slice(-4)}`) : "On File"}
          </span>
        </div>
      ),
    },
    {
      key: "applicantName",
      header: "Applicant Details",
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-bold text-dark dark:text-white text-xs">{r.applicantName}</p>
          <p className="text-[11px] text-body-color">{r.phone || "No phone"} • {r.email || "No email"}</p>
        </div>
      ),
    },
    {
      key: "serviceType",
      header: "Service Offering",
      sortable: true,
      render: (r) => (
        <span className="text-xs font-semibold text-primary block">
          {r.serviceType.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "deliveryType",
      header: "Channel",
      render: (r) => (
        <span className="text-xs text-body-color">
          {r.deliveryType ? r.deliveryType.replace(/_/g, " ") : "Office Pickup"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Desk Status",
      sortable: true,
      render: (r) => {
        const styles: Record<string, string> = {
          COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          VERIFIED: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
          PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
          REJECTED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles[r.status] || styles.PENDING}`}>
            {r.status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <button
          type="button"
          onClick={() => {
            setSelectedReq(r);
            setNewStatus(r.status);
            setStatusNote("");
            setProcessRefund(false);
            setActionError(null);
            setShowStatusModal(true);
          }}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition shadow-sm"
        >
          Update Status
        </button>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Pending", value: "PENDING" },
        { label: "Processing", value: "PROCESSING" },
        { label: "Verified", value: "VERIFIED" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Rejected", value: "REJECTED" },
      ],
    },
    {
      key: "serviceType",
      label: "Service",
      options: [
        { label: "Plastic Card", value: "PLASTIC_CARD" },
        { label: "Slip Retrieval", value: "SLIP_RETRIEVAL" },
        { label: "Modification Guidance", value: "MODIFICATION_GUIDANCE" },
        { label: "Harmonization Check", value: "HARMONIZATION_CHECK" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="NIN Operations & Verification Desk"
      breadcrumbs={[{ label: "NIN Operations Desk" }]}
    >
      <div className="space-y-6">
        {/* Alerts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Veripine Provider Gateway Card */}
        <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-dark dark:text-white uppercase tracking-wider">
                Veripine Identity Provider Gateway
              </h3>
              <p className="text-[11px] text-body-color">
                Server-side credential isolation. Check upstream provider balance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {providerBalance && (
              <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-dark text-xs font-mono font-bold text-dark dark:text-white">
                Balance: {providerBalance}
              </span>
            )}
            <button
              onClick={checkVeripineBalance}
              disabled={checkingBalance}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={"w-3.5 h-3.5 " + (checkingBalance ? "animate-spin" : "")} />
              <span>{checkingBalance ? 'Checking…' : 'Check Provider Balance'}</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Applications</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{requests.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Pending Review</span>
            <p className="text-xl font-bold text-amber-600 mt-1">
              {requests.filter((r) => r.status === "PENDING").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">In Production</span>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {requests.filter((r) => r.status === "PROCESSING" || r.status === "VERIFIED").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Completed</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {requests.filter((r) => r.status === "COMPLETED").length}
            </p>
          </div>
        </div>

        {/* Requests Table */}
        <AdminDataTable
          columns={columns}
          data={requests}
          loading={loading}
          error={error}
          onRetry={loadRequests}
          searchPlaceholder="Search by tracking number, applicant name, or phone..."
          searchKeys={["trackingNumber", "applicantName", "phone", "email", "serviceType"]}
          filters={filters}
          emptyTitle="No NIN requests found"
          emptyDescription="Customer requests for NIN reprints, verification, and plastic cards will appear here."
        />

        {/* Status Update Modal */}
        {showStatusModal && selectedReq && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Update NIN Request</h3>
                  <p className="text-xs text-body-color font-mono">{selectedReq.trackingNumber}</p>
                </div>
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Target Operational Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="PENDING">PENDING — Queued for review</option>
                    <option value="PROCESSING">PROCESSING — Verification in progress</option>
                    <option value="VERIFIED">VERIFIED — Documentation authenticated</option>
                    <option value="COMPLETED">COMPLETED — Card printed / Slip issued</option>
                    <option value="REJECTED">REJECTED — Application declined</option>
                  </select>
                </div>

                {newStatus === "REJECTED" && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={processRefund}
                        onChange={(e) => setProcessRefund(e.target.checked)}
                        className="mt-0.5"
                      />
                      <div>
                        <strong className="text-rose-900 dark:text-rose-200 font-bold block">
                          Refund Fee to Customer Wallet
                        </strong>
                        <span className="text-rose-700 dark:text-rose-400 text-[11px]">
                          Automatically credits original fee back to the applicant&apos;s digital wallet with balancing ledger entry.
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Internal / Operational Note
                  </label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Card printed with secure laminate. Physical pickup available at Origanrigan Cele Area desk."
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Save Status</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
