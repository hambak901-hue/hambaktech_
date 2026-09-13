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
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { NINRequest, NINRequestStatus, NINServiceType } from "@/types/platform";

export default function AdminNINPage() {
  const [requests, setRequests] = useState<NINRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<NINRequest | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<NINRequestStatus>("READY_FOR_PICKUP");
  const [statusNote, setStatusNote] = useState("");

  const loadRequests = () => {
    try {
      setLoading(true);
      const list = platformApi.getNINRequests();
      setRequests([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load NIN requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReq) {
      platformApi.updateNINStatus(selectedReq.id, newStatus, statusNote);
      setShowStatusModal(false);
      setStatusNote("");
      loadRequests();
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
            NIN: {r.ninNumber ? `***${r.ninNumber.slice(-4)}` : "Verified on File"}
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
          <p className="text-[11px] text-body-color">{r.phone} • {r.email}</p>
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
          READY_FOR_PICKUP: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          COMPLETED: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
          PARTNER_PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          DOCUMENT_VERIFICATION: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
          SUBMITTED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
          QUERY_ISSUED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles[r.status] || styles.SUBMITTED}`}>
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
            setShowStatusModal(true);
          }}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition shadow-sm"
        >
          Update
        </button>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Submitted", value: "SUBMITTED" },
        { label: "Verification", value: "DOCUMENT_VERIFICATION" },
        { label: "Processing", value: "PARTNER_PROCESSING" },
        { label: "Ready for Pickup", value: "READY_FOR_PICKUP" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Query Issued", value: "QUERY_ISSUED" },
      ],
    },
    {
      key: "serviceType",
      label: "Service",
      options: [
        { label: "Plastic Card", value: "PLASTIC_ID_CARD" },
        { label: "Slip Retrieval", value: "SLIP_RETRIEVAL" },
        { label: "Modification", value: "DATA_MODIFICATION" },
        { label: "BVN Harmonization", value: "BVN_HARMONIZATION" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="NIN Operations & Verification Desk"
      breadcrumbs={[{ label: "NIN Operations Desk" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Applications</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{requests.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Ready for Collection</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {requests.filter((r) => r.status === "READY_FOR_PICKUP").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">In Production</span>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {requests.filter((r) => r.status === "PARTNER_PROCESSING" || r.status === "DOCUMENT_VERIFICATION").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Completed</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">
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
                  <h3 className="text-base font-bold text-dark dark:text-white">Update NIN Status</h3>
                  <p className="text-xs text-body-color">{selectedReq.trackingNumber}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Target Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as NINRequestStatus)}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="DOCUMENT_VERIFICATION">DOCUMENT VERIFICATION</option>
                    <option value="PARTNER_PROCESSING">PARTNER PROCESSING</option>
                    <option value="READY_FOR_PICKUP">READY FOR PICKUP (Desk Origanrigan)</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="QUERY_ISSUED">QUERY ISSUED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Internal / Dispatch Note
                  </label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Card printed and verified. Ready for collection at Origanrigan desk."
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Save Status
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
