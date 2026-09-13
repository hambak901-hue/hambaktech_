"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  FileCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Eye,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { CACRequest, CACRequestStatus } from "@/types/platform";

export default function AdminCACPage() {
  const [requests, setRequests] = useState<CACRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<CACRequest | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<CACRequestStatus>("NAME_RESERVATION");
  const [statusNote, setStatusNote] = useState("");

  const loadRequests = () => {
    try {
      setLoading(true);
      const list = platformApi.getCACRequests();
      setRequests([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load CAC applications");
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
      platformApi.updateCACStatus(selectedReq.id, newStatus, statusNote);
      setShowStatusModal(false);
      setStatusNote("");
      loadRequests();
    }
  };

  const columns: Column<CACRequest>[] = [
    {
      key: "trackingNumber",
      header: "Tracking Number",
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-bold text-dark dark:text-white block">
            {r.trackingNumber}
          </span>
          <span className="text-[11px] font-bold text-primary">
            {r.entityType.replace(/_/g, " ")}
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
          <p className="text-[11px] text-body-color">{r.applicantPhone} • {r.applicantEmail}</p>
        </div>
      ),
    },
    {
      key: "proposedName1",
      header: "Proposed Business Names",
      render: (r) => (
        <div className="max-w-xs">
          <p className="font-bold text-xs text-dark dark:text-white truncate">1. {r.proposedName1}</p>
          {r.proposedName2 && (
            <p className="text-[11px] text-body-color truncate">2. {r.proposedName2}</p>
          )}
        </div>
      ),
    },
    {
      key: "natureOfBusiness",
      header: "Nature of Business",
      render: (r) => (
        <span className="text-xs text-body-color line-clamp-1 max-w-[180px]" title={r.natureOfBusiness}>
          {r.natureOfBusiness}
        </span>
      ),
    },
    {
      key: "status",
      header: "CAC Stage",
      sortable: true,
      render: (r) => {
        const styles: Record<string, string> = {
          COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          APPROVED_CERTIFICATE_READY: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
          SUBMITTED_TO_PORTAL: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          DOCUMENT_PREPARATION: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
          NAME_RESERVATION: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
          DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          QUERIED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles[r.status] || styles.DRAFT}`}>
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
      label: "Stage",
      options: [
        { label: "Name Reservation", value: "NAME_RESERVATION" },
        { label: "Document Preparation", value: "DOCUMENT_PREPARATION" },
        { label: "Submitted to Portal", value: "SUBMITTED_TO_PORTAL" },
        { label: "Queried", value: "QUERIED" },
        { label: "Approved / Ready", value: "APPROVED_CERTIFICATE_READY" },
        { label: "Completed", value: "COMPLETED" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="CAC Corporate Affairs Liaison Desk"
      breadcrumbs={[{ label: "CAC Liaison Desk" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Applications</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{requests.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">In Reservation / Prep</span>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {requests.filter((r) => r.status === "NAME_RESERVATION" || r.status === "DOCUMENT_PREPARATION").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Queries Pending</span>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {requests.filter((r) => r.status === "QUERIED").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Approved Entities</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {requests.filter((r) => r.status === "COMPLETED" || r.status === "APPROVED_CERTIFICATE_READY").length}
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
          searchPlaceholder="Search by tracking number, proposed name, or applicant..."
          searchKeys={["trackingNumber", "applicantName", "applicantPhone", "proposedName1", "proposedName2", "natureOfBusiness"]}
          filters={filters}
          emptyTitle="No CAC requests found"
          emptyDescription="Customer corporate affairs filings and name reservations will appear here."
        />

        {/* Status Update Modal */}
        {showStatusModal && selectedReq && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Update CAC Application Stage</h3>
                  <p className="text-xs text-body-color">{selectedReq.trackingNumber}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Target Stage
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as CACRequestStatus)}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="NAME_RESERVATION">NAME RESERVATION (Portal Reservation)</option>
                    <option value="DOCUMENT_PREPARATION">DOCUMENT PREPARATION</option>
                    <option value="SUBMITTED_TO_PORTAL">SUBMITTED TO PORTAL</option>
                    <option value="QUERIED">QUERIED (CAC Action Required)</option>
                    <option value="APPROVED_CERTIFICATE_READY">APPROVED / CERTIFICATE READY</option>
                    <option value="COMPLETED">COMPLETED (Handover Complete)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Status Update Note (Visible to Applicant)
                  </label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Name reservation approved by CAC. Now proceeding with stamp duty & document signing."
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
                    Save Stage
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
