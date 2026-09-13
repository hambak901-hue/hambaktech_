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
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { Transaction } from "@/types/platform";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modals
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    userName: "",
    type: "WALLET_TOPUP" as Transaction["type"],
    amount: 1000,
    fee: 0,
    status: "SUCCESSFUL" as Transaction["status"],
    paymentMethod: "WALLET" as Transaction["paymentMethod"],
    description: "",
  });

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

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ref = `HT-TX-${Date.now()}`;
      platformApi.createTransaction({
        reference: ref,
        userId: "admin-created",
        userName: formData.userName || "Customer",
        type: formData.type,
        amount: Number(formData.amount),
        fee: Number(formData.fee),
        currency: "NGN",
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        description: formData.description || `Manual Transaction ${ref}`,
      });
      loadTx();
      setShowCreateModal(false);
      setFormData({
        userName: "",
        type: "WALLET_TOPUP",
        amount: 1000,
        fee: 0,
        status: "SUCCESSFUL",
        paymentMethod: "WALLET",
        description: "",
      });
      notify(`Transaction ${ref} recorded successfully.`);
    } catch (err: any) {
      setError(err.message || "Failed to record transaction");
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    try {
      platformApi.updateTransaction(editingTx.id, {
        userName: formData.userName,
        type: formData.type,
        amount: Number(formData.amount),
        fee: Number(formData.fee),
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
      });
      loadTx();
      setEditingTx(null);
      notify(`Transaction ${editingTx.reference} updated successfully.`);
    } catch (err: any) {
      setError(err.message || "Failed to update transaction");
    }
  };

  const handleDelete = () => {
    if (!deletingTx) return;
    try {
      platformApi.deleteTransaction(deletingTx.id);
      loadTx();
      notify(`Transaction ${deletingTx.reference} voided.`);
      setDeletingTx(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete transaction");
    }
  };

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
      header: "Actions",
      align: "right",
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setSelectedTx(t)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-dark dark:hover:text-white transition"
            title="View Receipt Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingTx(t);
              setFormData({
                userName: t.userName || "",
                type: t.type,
                amount: t.amount,
                fee: t.fee || 0,
                status: t.status,
                paymentMethod: t.paymentMethod,
                description: t.description,
              });
            }}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-primary transition"
            title="Edit Transaction"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingTx(t)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-rose-50 dark:hover:bg-rose-950/40 text-body-color hover:text-rose-600 transition"
            title="Void / Delete Transaction"
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
      actionButton={
        <button
          type="button"
          onClick={() => {
            setFormData({
              userName: "",
              type: "WALLET_TOPUP",
              amount: 5000,
              fee: 0,
              status: "SUCCESSFUL",
              paymentMethod: "WALLET",
              description: "",
            });
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Transaction</span>
        </button>
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
                  <X className="w-4 h-4" />
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

        {/* Create Transaction Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <h3 className="text-base font-bold text-dark dark:text-white">Record Manual Ledger Transaction</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-dark dark:text-white mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-dark dark:text-white mb-1">Transaction Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-2 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="WALLET_TOPUP">Wallet Topup</option>
                      <option value="VTU_AIRTIME">VTU Airtime</option>
                      <option value="VTU_DATA">VTU Data</option>
                      <option value="ELECTRICITY_BILL">Electricity</option>
                      <option value="CABLE_TV">Cable TV</option>
                      <option value="CAC_SERVICE">CAC Service</option>
                      <option value="NIN_SERVICE">NIN Service</option>
                      <option value="ACADEMY_ENROLLMENT">Academy Enrollment</option>
                      <option value="REFUND">Refund</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-dark dark:text-white mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-full px-2 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="WALLET">WALLET</option>
                      <option value="PAYSTACK">PAYSTACK</option>
                      <option value="MONNIFY">MONNIFY</option>
                      <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-dark dark:text-white mb-1">Amount (₦)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-2 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="SUCCESSFUL">SUCCESSFUL</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-dark dark:text-white mb-1">Description / Narration</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the transaction..."
                    className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Record Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Transaction Modal */}
        {editingTx && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Edit Transaction Record</h3>
                  <span className="font-mono text-xs text-body-color">{editingTx.reference}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-dark dark:text-white mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-2 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="SUCCESSFUL">SUCCESSFUL</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-dark dark:text-white mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-full px-2 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="WALLET">WALLET</option>
                      <option value="PAYSTACK">PAYSTACK</option>
                      <option value="MONNIFY">MONNIFY</option>
                      <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-dark dark:text-white mb-1">Amount (₦)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-dark dark:text-white mb-1">Fee (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-dark dark:text-white mb-1">Description / Narration</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="px-4 py-2 font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Update Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingTx && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-sm w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Void Transaction</h3>
                  <p className="text-xs text-body-color">Are you sure you want to void this record?</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-dark rounded-xl text-xs space-y-1 font-mono">
                <p className="font-bold text-dark dark:text-white">{deletingTx.reference}</p>
                <p className="text-body-color">₦{deletingTx.amount.toLocaleString()} - {deletingTx.userName}</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingTx(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition shadow-sm"
                >
                  Confirm Void
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

