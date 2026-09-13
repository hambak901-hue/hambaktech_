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
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { CACRequest, CACRequestStatus } from "@/types/platform";

export default function AdminCACPage() {
  const [requests, setRequests] = useState<CACRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Modals & Selected items
  const [selectedReq, setSelectedReq] = useState<CACRequest | null>(null);
  const [viewingReq, setViewingReq] = useState<CACRequest | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReq, setEditingReq] = useState<CACRequest | null>(null);
  const [deletingReq, setDeletingReq] = useState<CACRequest | null>(null);

  // Quick Status Form
  const [newStatus, setNewStatus] = useState<CACRequestStatus>("NAME_RESERVATION");
  const [statusNote, setStatusNote] = useState("");

  // Create / Edit Form State
  const [formEntityType, setFormEntityType] = useState<CACRequest["entityType"]>("BUSINESS_NAME");
  const [formProposedName1, setFormProposedName1] = useState("");
  const [formProposedName2, setFormProposedName2] = useState("");
  const [formApplicantName, setFormApplicantName] = useState("");
  const [formApplicantPhone, setFormApplicantPhone] = useState("");
  const [formApplicantEmail, setFormApplicantEmail] = useState("");
  const [formNatureOfBusiness, setFormNatureOfBusiness] = useState("");
  const [formDirectorsCount, setFormDirectorsCount] = useState<number>(1);
  const [formReqStatus, setFormReqStatus] = useState<CACRequestStatus>("NAME_RESERVATION");
  const [formNotes, setFormNotes] = useState("");

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

  const openCreateModal = () => {
    setFormEntityType("BUSINESS_NAME");
    setFormProposedName1("");
    setFormProposedName2("");
    setFormApplicantName("");
    setFormApplicantPhone("");
    setFormApplicantEmail("");
    setFormNatureOfBusiness("General Merchandising, Logistics & ICT Consultancy");
    setFormDirectorsCount(1);
    setFormReqStatus("NAME_RESERVATION");
    setFormNotes("New application recorded at front desk.");
    setShowCreateModal(true);
  };

  const openEditModal = (r: CACRequest) => {
    setEditingReq(r);
    setFormEntityType(r.entityType);
    setFormProposedName1(r.proposedName1);
    setFormProposedName2(r.proposedName2 || "");
    setFormApplicantName(r.applicantName);
    setFormApplicantPhone(r.applicantPhone);
    setFormApplicantEmail(r.applicantEmail);
    setFormNatureOfBusiness(r.natureOfBusiness);
    setFormDirectorsCount(r.directorsCount || 1);
    setFormReqStatus(r.status);
    setFormNotes(r.notes || "");
  };

  const handleCreateCAC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formApplicantName.trim() || !formProposedName1.trim()) return;

    try {
      platformApi.submitCACRequest({
        userId: "usr-admin-manual",
        entityType: formEntityType,
        proposedName1: formProposedName1.trim(),
        proposedName2: formProposedName2.trim() || undefined,
        natureOfBusiness: formNatureOfBusiness.trim(),
        applicantName: formApplicantName.trim(),
        applicantPhone: formApplicantPhone.trim(),
        applicantEmail: formApplicantEmail.trim() || "applicant@hambaktech.com.ng",
        directorsCount: Number(formDirectorsCount) || 1,
        notes: formNotes.trim(),
      });
      setShowCreateModal(false);
      setActionFeedback("CAC application successfully initiated.");
      setTimeout(() => setActionFeedback(null), 3500);
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to create CAC request");
    }
  };

  const handleUpdateCAC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq) return;

    try {
      platformApi.updateCACRequest(editingReq.id, {
        entityType: formEntityType,
        proposedName1: formProposedName1.trim(),
        proposedName2: formProposedName2.trim() || undefined,
        natureOfBusiness: formNatureOfBusiness.trim(),
        applicantName: formApplicantName.trim(),
        applicantPhone: formApplicantPhone.trim(),
        applicantEmail: formApplicantEmail.trim(),
        directorsCount: Number(formDirectorsCount) || 1,
        status: formReqStatus,
        notes: formNotes.trim(),
      });
      setEditingReq(null);
      setActionFeedback("CAC application details updated.");
      setTimeout(() => setActionFeedback(null), 3500);
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to update CAC request");
    }
  };

  const handleDeleteCAC = () => {
    if (!deletingReq) return;
    try {
      platformApi.deleteCACRequest(deletingReq.id);
      setDeletingReq(null);
      setActionFeedback(`Application ${deletingReq.trackingNumber} deleted.`);
      setTimeout(() => setActionFeedback(null), 3500);
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to delete CAC request");
    }
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReq) {
      platformApi.updateCACStatus(selectedReq.id, newStatus, statusNote);
      setShowStatusModal(false);
      setStatusNote("");
      setSelectedReq(null);
      setActionFeedback(`Stage updated to ${newStatus}`);
      setTimeout(() => setActionFeedback(null), 3500);
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
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewingReq(r)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-dark dark:hover:text-white transition"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openEditModal(r)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit Application"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedReq(r);
              setNewStatus(r.status);
              setShowStatusModal(true);
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition shadow-sm"
          >
            Stage
          </button>
          <button
            type="button"
            onClick={() => setDeletingReq(r)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Application"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
        {/* Top bar with Add CAC application CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white">Corporate Filing & Name Reservation Desk</h2>
            <p className="text-xs text-body-color">Manage business name, company registration, trustees, and post-incorporation workflows.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New CAC Application</span>
          </button>
        </div>

        {/* Action feedback */}
        {actionFeedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionFeedback}</span>
          </div>
        )}

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

        {/* View Application Modal */}
        {viewingReq && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">{viewingReq.trackingNumber}</h3>
                    <span className="text-xs text-primary font-bold">{viewingReq.entityType.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReq(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-dark rounded-xl space-y-3 text-xs">
                <div>
                  <span className="text-body-color block mb-1">Proposed Business Names:</span>
                  <p className="font-bold text-dark dark:text-white">1. {viewingReq.proposedName1}</p>
                  {viewingReq.proposedName2 && (
                    <p className="text-body-color">2. {viewingReq.proposedName2}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-stroke/40 dark:border-strokedark/40">
                  <span className="text-body-color block mb-1">Applicant Contact:</span>
                  <p className="font-semibold text-dark dark:text-white">{viewingReq.applicantName}</p>
                  <p className="text-body-color">{viewingReq.applicantPhone} • {viewingReq.applicantEmail}</p>
                </div>

                <div className="pt-2 border-t border-stroke/40 dark:border-strokedark/40">
                  <span className="text-body-color block mb-1">Nature of Business:</span>
                  <p className="text-dark dark:text-white leading-relaxed">{viewingReq.natureOfBusiness}</p>
                </div>

                <div className="flex justify-between pt-2 border-t border-stroke/40 dark:border-strokedark/40">
                  <span className="text-body-color">Directors / Trustees:</span>
                  <span className="font-bold text-dark dark:text-white">{viewingReq.directorsCount || 1} Person(s)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-body-color">Current Stage:</span>
                  <span className="font-bold text-primary">{viewingReq.status.replace(/_/g, " ")}</span>
                </div>

                {viewingReq.notes && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300">
                    <span className="font-bold block mb-0.5">Application Notes:</span>
                    <p>{viewingReq.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const r = viewingReq;
                    setViewingReq(null);
                    openEditModal(r);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                >
                  Edit Application
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReq(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Application Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">New CAC Filing</h3>
                    <p className="text-xs text-body-color">Initiate corporate filing or name reservation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCAC} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Entity Classification *</label>
                  <select
                    value={formEntityType}
                    onChange={(e) => setFormEntityType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="BUSINESS_NAME">Business Name (Sole Proprietorship / Enterprise)</option>
                    <option value="PRIVATE_LIMITED_COMPANY">Private Limited Company (LTD)</option>
                    <option value="INCORPORATED_TRUSTEES">Incorporated Trustees (NGO / Church / Foundation)</option>
                    <option value="LIMITED_LIABILITY_PARTNERSHIP">Limited Liability Partnership (LLP)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Proposed Name 1 *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zenith Cleaners"
                      value={formProposedName1}
                      onChange={(e) => setFormProposedName1(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Proposed Name 2 (Alt)</label>
                    <input
                      type="text"
                      placeholder="e.g. Zenith Integrated Cleaners"
                      value={formProposedName2}
                      onChange={(e) => setFormProposedName2(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Applicant Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adebayo Ogunlesi"
                      value={formApplicantName}
                      onChange={(e) => setFormApplicantName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Applicant Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="08012345678"
                      value={formApplicantPhone}
                      onChange={(e) => setFormApplicantPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Applicant Email</label>
                    <input
                      type="email"
                      placeholder="applicant@email.com"
                      value={formApplicantEmail}
                      onChange={(e) => setFormApplicantEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Directors Count</label>
                    <input
                      type="number"
                      min={1}
                      value={formDirectorsCount}
                      onChange={(e) => setFormDirectorsCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Nature of Business</label>
                  <textarea
                    rows={2}
                    value={formNatureOfBusiness}
                    onChange={(e) => setFormNatureOfBusiness(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Desk Notes</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Create Filing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Application Modal */}
        {editingReq && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit CAC Application</h3>
                    <p className="text-xs text-body-color">{editingReq.trackingNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingReq(null)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateCAC} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Entity Classification</label>
                    <select
                      value={formEntityType}
                      onChange={(e) => setFormEntityType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="BUSINESS_NAME">Business Name</option>
                      <option value="PRIVATE_LIMITED_COMPANY">Private Limited Company (LTD)</option>
                      <option value="INCORPORATED_TRUSTEES">Incorporated Trustees</option>
                      <option value="LIMITED_LIABILITY_PARTNERSHIP">Limited Liability Partnership</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Stage</label>
                    <select
                      value={formReqStatus}
                      onChange={(e) => setFormReqStatus(e.target.value as CACRequestStatus)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="NAME_RESERVATION">NAME_RESERVATION</option>
                      <option value="DOCUMENT_PREPARATION">DOCUMENT_PREPARATION</option>
                      <option value="SUBMITTED_TO_PORTAL">SUBMITTED_TO_PORTAL</option>
                      <option value="QUERIED">QUERIED</option>
                      <option value="APPROVED_CERTIFICATE_READY">APPROVED_CERTIFICATE_READY</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Proposed Name 1 *</label>
                    <input
                      type="text"
                      required
                      value={formProposedName1}
                      onChange={(e) => setFormProposedName1(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Proposed Name 2 (Alt)</label>
                    <input
                      type="text"
                      value={formProposedName2}
                      onChange={(e) => setFormProposedName2(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Applicant Name *</label>
                    <input
                      type="text"
                      required
                      value={formApplicantName}
                      onChange={(e) => setFormApplicantName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Applicant Phone</label>
                    <input
                      type="tel"
                      value={formApplicantPhone}
                      onChange={(e) => setFormApplicantPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Applicant Email</label>
                    <input
                      type="email"
                      value={formApplicantEmail}
                      onChange={(e) => setFormApplicantEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Directors Count</label>
                    <input
                      type="number"
                      min={1}
                      value={formDirectorsCount}
                      onChange={(e) => setFormDirectorsCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Nature of Business</label>
                  <textarea
                    rows={2}
                    value={formNatureOfBusiness}
                    onChange={(e) => setFormNatureOfBusiness(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Desk Notes</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingReq(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Application Modal */}
        {deletingReq && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete CAC Application</h3>
                  <p className="text-xs text-body-color">Removal of filing record</p>
                </div>
              </div>

              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to permanently delete application <strong className="text-dark dark:text-white">{deletingReq.trackingNumber}</strong> ({deletingReq.proposedName1})? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingReq(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCAC}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Status Update Modal */}
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
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedReq(null);
                    }}
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

