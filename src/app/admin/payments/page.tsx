"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
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

  // CRUD Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAttempt, setViewingAttempt] = useState<PaymentAttempt | null>(null);
  const [editingAttempt, setEditingAttempt] = useState<PaymentAttempt | null>(null);
  const [deletingAttempt, setDeletingAttempt] = useState<PaymentAttempt | null>(null);

  // Form states
  const [formRef, setFormRef] = useState("");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formCustomerEmail, setFormCustomerEmail] = useState("");
  const [formAmount, setFormAmount] = useState<number>(5000);
  const [formGateway, setFormGateway] = useState<PaymentAttempt["gateway"]>("PAYSTACK");
  const [formServiceType, setFormServiceType] = useState("WALLET_FUNDING");
  const [formChannel, setFormChannel] = useState("card");
  const [formStatus, setFormStatus] = useState<PaymentAttempt["status"]>("SUCCESS");
  const [formResponse, setFormResponse] = useState("Approved by financial institution");

  const loadPayments = () => {
    try {
      setLoading(true);
      const list = platformApi.getPaymentAttempts();
      setAttempts([...list]);
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

  const openCreateModal = () => {
    setFormRef(`REF-${Date.now().toString().slice(-8)}`);
    setFormCustomerName("");
    setFormCustomerEmail("");
    setFormAmount(5000);
    setFormGateway("PAYSTACK");
    setFormServiceType("WALLET_FUNDING");
    setFormChannel("card");
    setFormStatus("SUCCESS");
    setFormResponse("Approved by financial institution");
    setShowCreateModal(true);
  };

  const openEditModal = (p: PaymentAttempt) => {
    setEditingAttempt(p);
    setFormRef(p.reference);
    setFormCustomerName(p.customerName);
    setFormCustomerEmail(p.customerEmail);
    setFormAmount(p.amount);
    setFormGateway(p.gateway);
    setFormServiceType(p.serviceType);
    setFormChannel(p.channel || "card");
    setFormStatus(p.status);
    setFormResponse(p.gatewayResponse || "Approved");
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.trim() || !formCustomerName.trim() || !formCustomerEmail.trim()) return;

    platformApi.createPaymentAttempt({
      reference: formRef.trim(),
      customerName: formCustomerName.trim(),
      customerEmail: formCustomerEmail.trim(),
      amount: Number(formAmount) || 0,
      currency: "NGN",
      gateway: formGateway,
      serviceType: formServiceType,
      channel: formChannel,
      status: formStatus,
      gatewayResponse: formResponse.trim(),
    });

    setShowCreateModal(false);
    setFeedback(`Payment attempt ${formRef} logged successfully.`);
    loadPayments();
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttempt) return;

    platformApi.updatePaymentAttempt(editingAttempt.id, {
      reference: formRef.trim(),
      customerName: formCustomerName.trim(),
      customerEmail: formCustomerEmail.trim(),
      amount: Number(formAmount) || 0,
      gateway: formGateway,
      serviceType: formServiceType,
      channel: formChannel,
      status: formStatus,
      gatewayResponse: formResponse.trim(),
    });

    setEditingAttempt(null);
    setFeedback(`Payment attempt ${editingAttempt.reference} updated.`);
    loadPayments();
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeletePayment = () => {
    if (!deletingAttempt) return;
    platformApi.deletePaymentAttempt(deletingAttempt.id);
    setDeletingAttempt(null);
    setFeedback(`Payment attempt record removed.`);
    loadPayments();
    setTimeout(() => setFeedback(null), 4000);
  };

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
        const isFail = p.status === "FAILED" || p.status === "ABANDONED";
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isSucc
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : isFail
              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          }`}>
            {isSucc ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : isFail ? <AlertCircle className="w-3 h-3 text-rose-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
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
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setViewingAttempt(p)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-primary transition"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleRequery(p.reference)}
            disabled={requerying === p.reference}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-teal-600 transition disabled:opacity-50"
            title="Requery Gateway API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${requerying === p.reference ? "animate-spin text-primary" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => openEditModal(p)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit Payment Record"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingAttempt(p)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Payment Attempt"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
      actionButton={
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
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

        {/* View Modal */}
        {viewingAttempt && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Payment Details</h3>
                    <p className="text-xs font-mono text-body-color">{viewingAttempt.reference}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingAttempt(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-body-color block mb-0.5 font-semibold">Customer</span>
                  <p className="font-bold text-dark dark:text-white">{viewingAttempt.customerName}</p>
                  <p className="text-body-color">{viewingAttempt.customerEmail}</p>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5 font-semibold">Amount</span>
                  <p className="text-base font-bold text-dark dark:text-white font-mono">
                    ₦{viewingAttempt.amount.toLocaleString()} {viewingAttempt.currency}
                  </p>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5 font-semibold">Gateway</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary">
                    {viewingAttempt.gateway}
                  </span>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5 font-semibold">Channel</span>
                  <p className="uppercase font-mono font-bold text-dark dark:text-white">
                    {viewingAttempt.channel || "card"}
                  </p>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5 font-semibold">Service Type</span>
                  <p className="font-medium text-dark dark:text-white">{viewingAttempt.serviceType}</p>
                </div>
                <div>
                  <span className="text-body-color block mb-0.5 font-semibold">Status</span>
                  <span className="font-bold text-emerald-600">{viewingAttempt.status}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-body-color block mb-0.5 font-semibold">Gateway Response</span>
                  <p className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark font-mono text-xs">
                    {viewingAttempt.gatewayResponse || "No raw response received"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-body-color block mb-0.5 font-semibold">Timestamp</span>
                  <p className="text-body-color">{new Date(viewingAttempt.createdAt).toLocaleString("en-NG")}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                <button
                  type="button"
                  onClick={() => setViewingAttempt(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Record Payment</h3>
                    <p className="text-xs text-body-color">Manually log an offline or verified gateway transaction</p>
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

              <form onSubmit={handleCreatePayment} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Reference Code *</label>
                  <input
                    type="text"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Customer Email *</label>
                    <input
                      type="email"
                      value={formCustomerEmail}
                      onChange={(e) => setFormCustomerEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Amount (₦) *</label>
                    <input
                      type="number"
                      min="100"
                      value={formAmount}
                      onChange={(e) => setFormAmount(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Gateway</label>
                    <select
                      value={formGateway}
                      onChange={(e) => setFormGateway(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="PAYSTACK">PAYSTACK</option>
                      <option value="MONIEPOINT">MONIEPOINT</option>
                      <option value="FLUTTERWAVE">FLUTTERWAVE</option>
                      <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Service Type</label>
                    <select
                      value={formServiceType}
                      onChange={(e) => setFormServiceType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="WALLET_FUNDING">WALLET FUNDING</option>
                      <option value="VTU_AIRTIME">VTU AIRTIME</option>
                      <option value="VTU_DATA">VTU DATA</option>
                      <option value="NIN_VERIFICATION">NIN VERIFICATION</option>
                      <option value="CAC_REGISTRATION">CAC REGISTRATION</option>
                      <option value="ACADEMY_COURSE">ACADEMY COURSE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                      <option value="INITIALIZED">INITIALIZED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Gateway Response Note</label>
                  <input
                    type="text"
                    value={formResponse}
                    onChange={(e) => setFormResponse(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
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
                    Save Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingAttempt && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit Payment Attempt</h3>
                    <p className="text-xs font-mono text-body-color">{editingAttempt.reference}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAttempt(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdatePayment} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Amount (₦) *</label>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Gateway</label>
                    <select
                      value={formGateway}
                      onChange={(e) => setFormGateway(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="PAYSTACK">PAYSTACK</option>
                      <option value="MONIEPOINT">MONIEPOINT</option>
                      <option value="FLUTTERWAVE">FLUTTERWAVE</option>
                      <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                      <option value="INITIALIZED">INITIALIZED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Gateway Response</label>
                  <input
                    type="text"
                    value={formResponse}
                    onChange={(e) => setFormResponse(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingAttempt(null)}
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

        {/* Delete Modal */}
        {deletingAttempt && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Payment Record</h3>
                  <p className="text-xs text-body-color">Removal of payment attempt history</p>
                </div>
              </div>
              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete payment reference &ldquo;<strong className="text-dark dark:text-white">{deletingAttempt.reference}</strong>&rdquo; for {deletingAttempt.customerName} (₦{deletingAttempt.amount.toLocaleString()})?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingAttempt(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePayment}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

