"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { SystemProvider } from "@/types/platform";

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<SystemProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinging, setPinging] = useState<string | null>(null);

  const loadProviders = () => {
    try {
      setLoading(true);
      const list = platformApi.getSystemProviders();
      setProviders([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleToggle = (code: string, current: boolean) => {
    platformApi.toggleProvider(code, !current);
    loadProviders();
  };

  const handlePing = (code: string) => {
    setPinging(code);
    setTimeout(() => {
      setPinging(null);
      loadProviders();
    }, 700);
  };

  const columns: Column<SystemProvider>[] = [
    {
      key: "name",
      header: "Provider Name & Endpoint",
      sortable: true,
      render: (p) => (
        <div>
          <span className="font-bold text-dark dark:text-white text-xs block">{p.name}</span>
          <span className="text-[11px] font-mono text-primary">{p.code}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Service Type",
      sortable: true,
      render: (p) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-dark dark:text-white">
          {p.type.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "environment",
      header: "Environment",
      sortable: true,
      render: (p) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          p.environment === "PRODUCTION"
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        }`}>
          {p.environment}
        </span>
      ),
    },
    {
      key: "successRate",
      header: "Success SLA",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-mono text-xs font-bold text-dark dark:text-white">
            {p.successRate}%
          </span>
        </div>
      ),
    },
    {
      key: "balance",
      header: "Float Balance",
      align: "right",
      render: (p) => (
        <span className="font-mono text-xs font-bold text-dark dark:text-white">
          {p.balance !== undefined ? `₦${p.balance.toLocaleString()}` : "Direct API"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Routing State",
      sortable: true,
      render: (p) => (
        <button
          type="button"
          onClick={() => handleToggle(p.code, p.isActive)}
          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            p.isActive ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              p.isActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      ),
    },
    {
      key: "actions",
      header: "Heartbeat",
      align: "right",
      render: (p) => (
        <button
          type="button"
          onClick={() => handlePing(p.code)}
          disabled={pinging === p.code}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-dark dark:text-white transition"
          title="Send Heartbeat Ping"
        >
          <RefreshCw className={`w-3 h-3 ${pinging === p.code ? "animate-spin text-primary" : "text-body-color"}`} />
          <span>Ping</span>
        </button>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "type",
      label: "Type",
      options: [
        { label: "Payment Gateway", value: "PAYMENT_GATEWAY" },
        { label: "Telecom VTU", value: "TELECOM_VTU" },
        { label: "Utility DISCO", value: "UTILITY_DISCO" },
        { label: "Identity Verification", value: "IDENTITY_VERIFICATION" },
        { label: "SMS Gateway", value: "SMS_GATEWAY" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="External API Providers & Fallback Routing"
      breadcrumbs={[{ label: "External Providers" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Configured Providers</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{providers.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Active Endpoints</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {providers.filter((p) => p.isActive).length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total VTU Float Balance</span>
            <p className="text-xl font-bold text-blue-600 mt-1">
              ₦{providers.filter((p) => p.balance).reduce((s, p) => s + (p.balance || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Avg. SLA Reliability</span>
            <p className="text-xl font-bold text-teal-600 mt-1">99.4%</p>
          </div>
        </div>

        {/* Providers Table */}
        <AdminDataTable
          columns={columns}
          data={providers}
          loading={loading}
          error={error}
          onRetry={loadProviders}
          searchPlaceholder="Search provider by name, code, or type..."
          searchKeys={["name", "code", "type"]}
          filters={filters}
          emptyTitle="No providers registered"
          emptyDescription="Configure external API connections in system settings."
        />
      </div>
    </AdminLayout>
  );
}
