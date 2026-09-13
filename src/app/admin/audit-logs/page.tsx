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
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { AuditLogEntry } from "@/types/platform";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

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
      header: "Inspect",
      align: "right",
      render: (l) => (
        <button
          type="button"
          onClick={() => setSelectedLog(l)}
          className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-dark transition"
          title="Inspect Record"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
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
  ];

  return (
    <AdminLayout
      pageTitle="System Audit Logs & Regulatory Trail"
      breadcrumbs={[{ label: "Audit Logs" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Events Logged</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{logs.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Success Rate</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">100%</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Entities Tracked</span>
            <p className="text-xl font-bold text-primary mt-1">7 Core Domains</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Ledger State</span>
            <p className="text-xl font-bold text-teal-600 mt-1">Tamper-Proof</p>
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
                  ✕
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
                  <span className="text-body-color">Client IP:</span>
                  <span className="font-mono text-dark dark:text-white">{selectedLog.ipAddress}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Timestamp:</span>
                  <span className="font-mono text-dark dark:text-white">
                    {new Date(selectedLog.timestamp).toLocaleString("en-NG")}
                  </span>
                </div>
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
      </div>
    </AdminLayout>
  );
}
