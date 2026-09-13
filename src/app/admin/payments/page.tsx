"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building,
  Smartphone,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { PaymentAttempt } from "@/types/platform";

export default function AdminPaymentsPage() {
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requerying, setRequerying] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadPayments = () => {
    try {
      setLoading(true);
      const list = platformApi.getPaymentAttempts();
      setAttempts(list);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load payment attempts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRequery = (reference: string) => {
    setRequerying(reference);
    setFeedback(null);
    setTimeout(() => {
      const updated = platformApi.verifyPaymentAttempt(reference);
      setRequerying(null);
      if (updated) {
        setFeedback(`Re-query completed for ${reference}: Status is ${updated.status}`);
        loadPayments();
      }
      setTimeout(() => setFeedback(null), 4000);
    }, 900);
  };

  const columns: Column<PaymentAttempt>[] = [
    {
      key: "reference",
      header: "Payment Reference",
      sortable: true,
      render: (p) => (
        <div>
          <span className="font-mono text-xs font-bold text-dark dark:text-white block">
            {p.reference}
          </span>
          <span className="text-[11px] text-body-color">{p.serviceType.replace("_", " ")}</span>
        </div>
      ),
    },
    {
      key: "gateway",
      header: "Gateway Provider",
      sortable: true,
      render: (p) => {
        const gwStyles: Record<string, string> = {
          PAYSTACK: "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300",
          MONIEPOINT: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
          FLUTTERWAVE: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
          OPAY: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
          BANK_TRANSFER: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300",
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${gwStyles[p.gateway] || gwStyles.PAYSTACK}`}>
            {p.gateway}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right",
      render: (p) => (
        <span className="font-mono text-xs font-bold text-dark dark:text-white">
          ₦{p.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      render: (p) => (
        <div>
          <p className="font-bold text-dark dark:text-white text-xs">{p.customerName}</p>
          <p className="text-[11px] text-body-color">{p.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      render: (p) => (
        <span className="text-xs uppercase font-mono text-body-color">
          {p.channel || "card"}
        </span>
      ),
    },
    {
      key: "gatewayResponse",
      header: "Gateway Response",
      render: (p) => (
        <span className="text-xs text-body-color truncate max-w-[180px] block" title={p.gatewayResponse}>
          {p.gatewayResponse || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Settlement Status",
      sortable: true,
      render: (p) => {
        const isSucc = p.status === "SUCCESS";
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isSucc
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          }`}>
            {isSucc ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
            <span>{p.status}</span>
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Initiated",
      sortable: true,
      render: (p) => (
        <span className="text-xs text-body-color">
          {new Date(p.createdAt).toLocaleDateString("en-NG", { dateStyle: "short" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <button
          type="button"
          onClick={() => handleRequery(p.reference)}
          disabled={requerying === p.reference}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-dark dark:text-white transition disabled:opacity-50"
          title="Re-query Payment Gateway API"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${requerying === p.reference ? "animate-spin text-primary" : "text-body-color"}`} />
          <span>Requery</span>
        </button>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "gateway",
      label: "Gateway",
      options: [
        { label: "Paystack", value: "PAYSTACK" },
        { label: "Moniepoint", value: "MONIEPOINT" },
        { label: "Flutterwave", value: "FLUTTERWAVE" },
        { label: "OPay", value: "OPAY" },
        { label: "Bank Transfer", value: "BANK_TRANSFER" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Success", value: "SUCCESS" },
        { label: "Pending", value: "PENDING" },
        { label: "Failed", value: "FAILED" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="Payment Gateway Verification & Logs"
      breadcrumbs={[{ label: "Payment Gateways" }]}
    >
      <div className="space-y-6">
        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Payment Attempts</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{attempts.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Settled via Paystack</span>
            <p className="text-xl font-bold text-teal-600 mt-1">
              ₦{attempts.filter((p) => p.gateway === "PAYSTACK" && p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Settled via Moniepoint</span>
            <p className="text-xl font-bold text-blue-600 mt-1">
              ₦{attempts.filter((p) => p.gateway === "MONIEPOINT" && p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Pending Resolution</span>
            <p className="text-xl font-bold text-amber-600 mt-1">
              {attempts.filter((p) => p.status === "PENDING").length}
            </p>
          </div>
        </div>

        {/* Payments Table */}
        <AdminDataTable
          columns={columns}
          data={attempts}
          loading={loading}
          error={error}
          onRetry={loadPayments}
          searchPlaceholder="Search reference, customer name, or email..."
          searchKeys={["reference", "customerName", "customerEmail"]}
          filters={filters}
          emptyTitle="No payment logs found"
          emptyDescription="Online payment attempts via Paystack, Moniepoint, and transfers will appear here."
        />
      </div>
    </AdminLayout>
  );
}
