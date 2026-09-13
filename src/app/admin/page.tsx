"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Building2,
  Settings,
  ArrowUpRight,
  Filter,
  Search,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import platformApi from "@/lib/api-client";
import { Order, NINRequest, CACRequest, SupportTicket } from "@/types/platform";

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ninRequests, setNinRequests] = useState<NINRequest[]>([]);
  const [cacRequests, setCacRequests] = useState<CACRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [wallet, setWallet] = useState(platformApi.getWallet());

  // Manual Credit Modal
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState(5000);
  const [creditDesc, setCreditDesc] = useState("Manual Admin Adjustment");

  useEffect(() => {
    // Ensure admin role for this view
    platformApi.switchRole("ADMIN");
    setOrders(platformApi.getOrders());
    setNinRequests(platformApi.getNINRequests());
    setCacRequests(platformApi.getCACRequests());
    setTickets(platformApi.getTickets());
    setWallet(platformApi.getWallet());
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingNIN = ninRequests.filter((n) => n.status !== "COMPLETED" && n.status !== "READY_FOR_PICKUP").length;
  const pendingCAC = cacRequests.filter((c) => c.status !== "APPROVED_CERTIFICATE_READY").length;
  const openTickets = tickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED").length;

  const handleUpdateOrderStatus = (orderId: string, newStatus: any) => {
    platformApi.updateOrderStatus(orderId, newStatus);
    setOrders(platformApi.getOrders());
  };

  const handleUpdateNINStatus = (id: string, newStatus: any) => {
    platformApi.updateNINStatus(id, newStatus, "Status updated by Operations Admin");
    setNinRequests(platformApi.getNINRequests());
  };

  const handleUpdateCACStatus = (id: string, newStatus: any) => {
    platformApi.updateCACStatus(id, newStatus, "Status updated by CAC Liaison Desk");
    setCacRequests(platformApi.getCACRequests());
  };

  const handleManualCredit = (e: React.FormEvent) => {
    e.preventDefault();
    platformApi.fundWallet(creditAmount, "ADMIN_TRANSFER", creditDesc);
    setWallet(platformApi.getWallet());
    setShowCreditModal(false);
    alert(`Successfully credited wallet with ₦${creditAmount.toLocaleString()}`);
  };

  return (
    <AdminLayout
      pageTitle="Operations Command Center"
      breadcrumbs={[{ label: "Admin Console" }]}
    >
      <div className="space-y-8">
        {/* Admin Operational Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-dark text-white border border-strokedark shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider">
                  Super Admin Mode
                </span>
                <span className="text-xs text-body-color-dark">Hambaktech & Services HQ</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">Platform Operations Console</h2>
              <p className="text-xs text-body-color-dark mt-0.5">
                Full governance over VTU gateways, NIN card production, CAC filings, and wallet ledgers.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreditModal(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition shadow-md shadow-primary/25 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Credit / Adjust Wallet</span>
            </button>
            <Link
              href="/admin/pricing"
              className="px-4 py-2.5 rounded-xl border border-strokedark hover:border-primary text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-primary" />
              <span>Pricing Engine</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-body-color">
                Total Gross Volume
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-white mt-2">
              ₦{totalRevenue.toLocaleString()}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>From {orders.length} total orders</span>
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-body-color">
                Pending NIN Desk
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-white mt-2">
              {pendingNIN}
            </h3>
            <span className="text-[11px] text-body-color mt-1 block">
              PVC printing & slip reprint queue
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-body-color">
                Pending CAC Filings
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-white mt-2">
              {pendingCAC}
            </h3>
            <span className="text-[11px] text-body-color mt-1 block">
              Corporate commission approvals
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-body-color">
                Active Help Tickets
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-white mt-2">
              {openTickets}
            </h3>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
              Requires support desk reply
            </span>
          </div>
        </div>

        {/* Live Service Gateway Health Grid */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <h3 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Core Integration Gateways Status</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {[
              { name: "MTN VTU API", status: "Operational", ping: "42ms" },
              { name: "Airtel Direct", status: "Operational", ping: "58ms" },
              { name: "Glo NG Bridge", status: "Operational", ping: "89ms" },
              { name: "Paystack Direct", status: "Operational", ping: "35ms" },
              { name: "EKEDC / IKEDC", status: "Operational", ping: "120ms" },
              { name: "NIMC Portal Desk", status: "Normal", ping: "210ms" },
            ].map((gw, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark flex flex-col justify-between"
              >
                <div>
                  <span className="font-bold text-dark dark:text-white block truncate">{gw.name}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {gw.status}
                  </span>
                </div>
                <span className="text-[10px] text-body-color font-mono mt-2">{gw.ping}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Table: Manage NIN Requests */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">
                NIN Desk Operations Queue
              </h3>
              <p className="text-xs text-body-color">Manage PVC printing status and pickup alerts</p>
            </div>
            <Link
              href="/dashboard/nin"
              className="text-xs font-bold text-primary hover:underline"
            >
              View User View →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                  <th className="pb-3 font-semibold">Ref</th>
                  <th className="pb-3 font-semibold">Applicant</th>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Current Status</th>
                  <th className="pb-3 font-semibold text-right">Operational Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {ninRequests.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/50">
                    <td className="py-3 font-mono font-bold text-primary">{n.trackingNumber}</td>
                    <td className="py-3 font-bold text-dark dark:text-white">{n.applicantName}</td>
                    <td className="py-3 text-body-color">{n.serviceType.replace(/_/g, " ")}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {n.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {n.status !== "READY_FOR_PICKUP" && (
                        <button
                          onClick={() => handleUpdateNINStatus(n.id, "READY_FOR_PICKUP")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700"
                        >
                          Mark Ready
                        </button>
                      )}
                      {n.status !== "COMPLETED" && (
                        <button
                          onClick={() => handleUpdateNINStatus(n.id, "COMPLETED")}
                          className="px-2.5 py-1 rounded-lg bg-primary text-white font-bold text-[10px] hover:bg-primary/90"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Table: Manage CAC Filings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">
                Corporate Affairs Commission (CAC) Desk Queue
              </h3>
              <p className="text-xs text-body-color">Manage registration milestones and issue certificates</p>
            </div>
            <Link
              href="/dashboard/cac"
              className="text-xs font-bold text-primary hover:underline"
            >
              View User View →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                  <th className="pb-3 font-semibold">Ref</th>
                  <th className="pb-3 font-semibold">Proposed Entity</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {cacRequests.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/50">
                    <td className="py-3 font-mono font-bold text-primary">{c.trackingNumber}</td>
                    <td className="py-3 font-bold text-dark dark:text-white">{c.proposedName1}</td>
                    <td className="py-3 text-body-color">{c.entityType.replace(/_/g, " ")}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {c.status !== "APPROVED_CERTIFICATE_READY" && (
                        <button
                          onClick={() => handleUpdateCACStatus(c.id, "APPROVED_CERTIFICATE_READY")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700"
                        >
                          Approve & Issue RC
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Manual Credit */}
        {showCreditModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-dark dark:text-white">
                Admin Manual Balance Adjustment
              </h3>
              <p className="text-xs text-body-color">
                Directly adjust customer wallet balance for testing, bonuses, or refunds.
              </p>

              <form onSubmit={handleManualCredit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    min={100}
                    step={100}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Audit Description / Memo
                  </label>
                  <input
                    type="text"
                    value={creditDesc}
                    onChange={(e) => setCreditDesc(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreditModal(false)}
                    className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-white font-bold"
                  >
                    Execute Credit
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
