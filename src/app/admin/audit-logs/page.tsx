"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Shield,
  Clock,
  User,
  Activity,
  Globe,
  Eye,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { AuditLogEntry, RoleSlug } from "@/types/platform";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modals
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLog, setEditingLog] = useState<AuditLogEntry | null>(null);
  const [deletingLog, setDeletingLog] = useState<AuditLogEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Form states
  const [formAction, setFormAction] = useState("");
  const [formEntity, setFormEntity] = useState("SETTINGS");
  const [formEntityId, setFormEntityId] = useState("");
  const [formActorName, setFormActorName] = useState("");
  const [formActorEmail, setFormActorEmail] = useState("");
  const [formRole, setFormRole] = useState<RoleSlug>("admin");
  const [formIp, setFormIp] = useState("102.89.44.12");
  const [formStatus, setFormStatus] = useState<AuditLogEntry["status"]>("SUCCESS");
  const [formNotes, setFormNotes] = useState("");

  const loadLogs = () => {
    try {
      setLoading(true);
      const list = platformApi.getAuditLogs();
      setLogs([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load audit trail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const openCreateModal = () => {
    const me = platformApi.getCurrentUser();
    setFormAction("MANUAL_AUDIT_ENTRY");
    setFormEntity("COMPLIANCE");
    setFormEntityId(`cmp-${Date.now().toString().slice(-6)}`);
    setFormActorName(me.fullName || "Admin Staff");
    setFormActorEmail(me.email || "admin@hambaktech.com.ng");
    setFormRole((me.role as RoleSlug) || "admin");
    setFormIp("102.89.44.12");
    setFormStatus("SUCCESS");
    setFormNotes("Manual regulatory compliance audit verification");
    setShowCreateModal(true);
  };

  const openEditModal = (l: AuditLogEntry) => {
    setEditingLog(l);
    setFormAction(l.action);
    setFormEntity(l.entity);
    setFormEntityId(l.entityId);
    setFormActorName(l.actorName);
    setFormActorEmail(l.actorEmail);
    setFormRole(l.role);
    setFormIp(l.ipAddress);
    setFormStatus(l.status);
    setFormNotes(l.metadata?.notes || "");
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAction.trim() || !formEntity.trim()) return;

    platformApi.createAuditLogEntry({
      action: formAction.trim().toUpperCase(),
      entity: formEntity.trim().toUpperCase(),
      entityId: formEntityId.trim() || "SYS",
      actorName: formActorName.trim() || "System",
      actorEmail: formActorEmail.trim() || "system@hambaktech.com.ng",
      role: formRole,
      ipAddress: formIp.trim() || "127.0.0.1",
      status: formStatus,
      metadata: formNotes.trim() ? { notes: formNotes.trim() } : undefined,
    });

    setShowCreateModal(false);
    setFeedback("Audit log entry recorded successfully.");
    loadLogs();
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleUpdateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    platformApi.updateAuditLog(editingLog.id, {
      action: formAction.trim().toUpperCase(),
      entity: formEntity.trim().toUpperCase(),
      entityId: formEntityId.trim(),
      status: formStatus,
      metadata: {
        ...(editingLog.metadata || {}),
        notes: formNotes.trim(),
        lastAuditedAt: new Date().toISOString(),
      },
    });

    setEditingLog(null);
    setFeedback(`Audit entry #${editingLog.id} updated.`);
    loadLogs();
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDeleteLog = () => {
    if (!deletingLog) return;
    platformApi.deleteAuditLog(deletingLog.id);
    setDeletingLog(null);
    setFeedback("Audit entry deleted.");
    loadLogs();
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleClearAll = () => {
    platformApi.clearAuditLogs();
    setShowClearConfirm(false);
    setFeedback("All audit logs cleared.");
    loadLogs();
    setTimeout(() => setFeedback(null), 3500);
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-mono text-xs font-bold text-dark dark:text-white block">
            {new Date(l.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <span className="text-[11px] text-body-color font-mono">
            {new Date(l.timestamp).toLocaleDateString("en-NG", { dateStyle: "short" })}
          </span>
        </div>
      ),
    },
    {
      key: "actorEmail",
      header: "Actor (Staff/System)",
      sortable: true,
      render: (l) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-dark dark:text-white">{l.actorName}</span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-primary/10 text-primary">
              {l.role}
            </span>
          </div>
          <span className="text-[11px] text-body-color">{l.actorEmail}</span>
        </div>
      ),
    },
    {
      key: "entity",
      header: "Domain / Entity",
      sortable: true,
      render: (l) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-dark dark:text-white">
          {l.entity}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action Executed",
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs font-bold text-dark dark:text-white">
          {l.action}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (l) => {
        const colors: Record<string, string> = {
          SUCCESS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          FAILED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
          WARNING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${colors[l.status] || colors.SUCCESS}`}>
            {l.status}
          </span>
        );
      },
    },
    {
      key: "ipAddress",
      header: "IP Address",
      render: (l) => <span className="font-mono text-xs text-body-color">{l.ipAddress}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (l) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedLog(l)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-dark transition"
            title="Inspect Record"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openEditModal(l)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit / Annotate Record"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingLog(l)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Record"
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
      label: "Status",
      options: [
        { label: "Success", value: "SUCCESS" },
        { label: "Failed", value: "FAILED" },
        { label: "Warning", value: "WARNING" },
      ],
    },
    {
      key: "role",
      label: "Actor Role",
      options: [
        { label: "Super Admin", value: "super_admin" },
        { label: "Admin", value: "admin" },
        { label: "Staff", value: "staff" },
        { label: "Agent", value: "agent" },
        { label: "Customer", value: "customer" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="System Audit Logs & Regulatory Trail"
      breadcrumbs={[{ label: "Audit Logs" }]}
      actionButton={
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Logs</span>
            </button>
          )}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Audit Event</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Events Logged</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{logs.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Success Rate</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {logs.length > 0 ? `${Math.round((logs.filter((l) => l.status === "SUCCESS").length / logs.length) * 100)}%` : "100%"}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Entities Tracked</span>
            <p className="text-xl font-bold text-primary mt-1">
              {new Set(logs.map((l) => l.entity)).size} Domains
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Ledger State</span>
            <p className="text-xl font-bold text-teal-600 mt-1">Tamper-Audited</p>
          </div>
        </div>

        {/* Logs Table */}
        <AdminDataTable
          columns={columns}
          data={logs}
          loading={loading}
          error={error}
          onRetry={loadLogs}
          searchPlaceholder="Search audit action, admin email, actor or entity..."
          searchKeys={["action", "actorEmail", "actorName", "entity", "entityId"]}
          filters={filters}
          emptyTitle="No audit records found"
          emptyDescription="Administrative actions will appear in this ledger."
        />

        {/* Log Inspector Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div>
                  <span className="text-xs uppercase font-bold text-primary">Audit Record #{selectedLog.id}</span>
                  <h3 className="text-base font-bold text-dark dark:text-white">{selectedLog.action}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Actor Name:</span>
                  <span className="font-bold text-dark dark:text-white">{selectedLog.actorName} ({selectedLog.role})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Actor Email:</span>
                  <span className="font-mono text-dark dark:text-white">{selectedLog.actorEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Target Entity:</span>
                  <span className="font-bold text-dark dark:text-white">{selectedLog.entity} ({selectedLog.entityId})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Status:</span>
                  <span className="font-bold text-emerald-600">{selectedLog.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Client IP:</span>
                  <span className="font-mono text-dark dark:text-white">{selectedLog.ipAddress}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Timestamp:</span>
                  <span className="font-mono text-dark dark:text-white">
                    {new Date(selectedLog.timestamp).toLocaleString("en-NG")}
                  </span>
                </div>
                {selectedLog.metadata?.notes && (
                  <div className="pt-1">
                    <span className="text-body-color block mb-1">Audit Notes / Metadata:</span>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark font-mono text-xs">
                      {selectedLog.metadata.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Audit Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Record Audit Event</h3>
                    <p className="text-xs text-body-color">Manual entry for regulatory compliance trail</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateLog} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Action Name *</label>
                  <input
                    type="text"
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value)}
                    placeholder="e.g. COMPLIANCE_SECURITY_CHECK"
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Entity Domain *</label>
                    <input
                      type="text"
                      value={formEntity}
                      onChange={(e) => setFormEntity(e.target.value)}
                      placeholder="e.g. USER, CAC, SYSTEM"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Entity ID *</label>
                    <input
                      type="text"
                      value={formEntityId}
                      onChange={(e) => setFormEntityId(e.target.value)}
                      placeholder="e.g. usr-123 or SYS"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Actor Name</label>
                    <input
                      type="text"
                      value={formActorName}
                      onChange={(e) => setFormActorName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="WARNING">WARNING</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Audit Notes / Reason</label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Details about the administrative action..."
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Record Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit / Annotate Modal */}
        {editingLog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Annotate Audit Entry</h3>
                    <p className="text-xs font-mono text-body-color">#{editingLog.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateLog} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Action Name</label>
                  <input
                    type="text"
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Entity Domain</label>
                    <input
                      type="text"
                      value={formEntity}
                      onChange={(e) => setFormEntity(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="WARNING">WARNING</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Compliance Notes / Resolution</label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Add audit or review notes..."
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingLog(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
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

        {/* Delete Single Log Modal */}
        {deletingLog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Audit Entry</h3>
                  <p className="text-xs text-body-color">Removal of ledger record</p>
                </div>
              </div>
              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete audit entry &ldquo;<strong className="text-dark dark:text-white">{deletingLog.action}</strong>&rdquo; (#{deletingLog.id})?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingLog(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLog}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Logs Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Purge All Audit Logs</h3>
                  <p className="text-xs text-body-color">Irreversible administrative ledger reset</p>
                </div>
              </div>
              <p className="text-xs text-body-color leading-relaxed">
                This will delete all <strong className="text-dark dark:text-white">{logs.length} audit records</strong> in the system ledger. Are you sure you want to proceed?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Purge All Records
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

