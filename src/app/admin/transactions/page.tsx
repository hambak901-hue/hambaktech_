"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  FileText,
  Download,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { Transaction } from "@/types/platform";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const loadTx = () => {
    try {
      setLoading(true);
      const list = platformApi.getTransactions();
      setTransactions(list);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTx();
  }, []);

  const totalVolume = transactions
    .filter((t) => t.status === "SUCCESSFUL")
    .reduce((sum, t) => sum + t.amount, 0);

  const columns: Column<Transaction>[] = [
    {
      key: "reference",
      header: "Reference",
      sortable: true,
      render: (t) => (
        <div>
          <span className="font-mono text-xs font-bold text-dark dark:text-white block">
            {t.reference}
          </span>
          <span className="text-[11px] text-body-color truncate max-w-[200px] block">
            {t.description}
          </span>
        </div>
      ),
    },
    {
      key: "userName",
      header: "Customer",
      sortable: true,
      render: (t) => (
        <span className="text-xs font-semibold text-dark dark:text-white">
          {t.userName || "Customer"}
        </span>
      ),
    },
    {
      key: "type",
      header: "Transaction Type",
      sortable: true,
      render: (t) => {
        const isCredit = t.type === "WALLET_TOPUP" || t.type === "REFUND";
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isCredit
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
          }`}>
            {isCredit ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-blue-600" />}
            <span>{t.type.replace(/_/g, " ")}</span>
          </span>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right",
      render: (t) => (
        <span className="font-mono text-xs font-bold text-dark dark:text-white">
          ₦{t.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "fee",
      header: "Fee",
      align: "right",
      render: (t) => (
        <span className="font-mono text-xs text-body-color">
          ₦{(t.fee || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Method",
      render: (t) => (
        <span className="text-xs font-mono uppercase bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-dark dark:text-white">
          {t.paymentMethod || "WALLET"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (t) => {
        const isSucc = t.status === "SUCCESSFUL";
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isSucc
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          }`}>
            {isSucc ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
            <span>{t.status}</span>
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      render: (t) => (
        <span className="text-xs text-body-color">
          {new Date(t.createdAt).toLocaleString("en-NG", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Details",
      align: "right",
      render: (t) => (
        <button
          type="button"
          onClick={() => setSelectedTx(t)}
          className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-dark dark:hover:text-white transition"
          title="View Receipt Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Successful", value: "SUCCESSFUL" },
        { label: "Pending", value: "PENDING" },
        { label: "Failed", value: "FAILED" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { label: "Wallet Topup", value: "WALLET_TOPUP" },
        { label: "VTU Airtime", value: "VTU_AIRTIME" },
        { label: "VTU Data", value: "VTU_DATA" },
        { label: "Electricity Bill", value: "ELECTRICITY_BILL" },
        { label: "Cable TV", value: "CABLE_TV" },
        { label: "CAC Service", value: "CAC_SERVICE" },
        { label: "NIN Service", value: "NIN_SERVICE" },
        { label: "Academy Enrollment", value: "ACADEMY_ENROLLMENT" },
        { label: "Refund", value: "REFUND" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="Transactions Ledger & Accounting"
      breadcrumbs={[{ label: "Transactions Ledger" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Transaction Count</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{transactions.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Settled Gross Volume</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              ₦{totalVolume.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Success Settlement Rate</span>
            <p className="text-xl font-bold text-blue-600 mt-1">98.4%</p>
          </div>
        </div>

        {/* Transactions Table */}
        <AdminDataTable
          columns={columns}
          data={transactions}
          loading={loading}
          error={error}
          onRetry={loadTx}
          searchPlaceholder="Search reference, description, or customer..."
          searchKeys={["reference", "description", "userName"]}
          filters={filters}
          emptyTitle="No transactions logged"
          emptyDescription="Transactions will be registered automatically as services are ordered."
        />

        {/* Transaction Detail Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div>
                  <span className="text-xs uppercase font-bold text-primary">Transaction Audit Record</span>
                  <h3 className="text-base font-bold text-dark dark:text-white font-mono">
                    {selectedTx.reference}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Customer:</span>
                  <span className="font-bold text-dark dark:text-white">{selectedTx.userName || "Customer"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Transaction Type:</span>
                  <span className="font-bold text-dark dark:text-white">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Amount:</span>
                  <span className="font-bold font-mono text-dark dark:text-white">
                    ₦{selectedTx.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Processing Fee:</span>
                  <span className="font-mono text-dark dark:text-white">₦{(selectedTx.fee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Status:</span>
                  <span className="font-bold text-emerald-600">{selectedTx.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Payment Gateway / Source:</span>
                  <span className="font-bold font-mono">{selectedTx.paymentMethod || "WALLET"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stroke/50 dark:border-strokedark/50">
                  <span className="text-body-color">Timestamp:</span>
                  <span className="text-body-color">{new Date(selectedTx.createdAt).toLocaleString("en-NG")}</span>
                </div>
                <div className="pt-2">
                  <span className="text-body-color block mb-1">Narration:</span>
                  <p className="p-2.5 bg-gray-50 dark:bg-gray-dark rounded-xl text-dark dark:text-white font-mono">
                    {selectedTx.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
