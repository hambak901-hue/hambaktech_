"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Zap,
  Tv,
  ShieldCheck,
  Building2,
  Printer,
  ChevronRight,
  Search,
  ExternalLink,
  Plus,
  Compass,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { Order, Transaction, NINRequest, CACRequest } from "@/types/platform";
import companyConfig from "@/data/companyConfig";

export default function DashboardOverviewPage() {
  const [wallet, setWallet] = useState(platformApi.getWallet());
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quickTrackQuery, setQuickTrackQuery] = useState("");
  const [trackResult, setTrackResult] = useState<{
    found: boolean;
    type?: "NIN" | "CAC" | "ORDER";
    title?: string;
    status?: string;
    notes?: string;
  } | null>(null);

  useEffect(() => {
    setWallet(platformApi.getWallet());
    setOrders(platformApi.getOrders().slice(0, 5));
    setTransactions(platformApi.getTransactions().slice(0, 5));
  }, []);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackQuery.trim()) return;

    const q = quickTrackQuery.trim().toUpperCase();
    if (q.includes("NIN")) {
      const nin = platformApi.trackNINRequest(q);
      if (nin) {
        setTrackResult({
          found: true,
          type: "NIN",
          title: `NIN Service: ${nin.serviceType.replace(/_/g, " ")}`,
          status: nin.status,
          notes: nin.notes || "Document under review with verification channels.",
        });
        return;
      }
    } else if (q.includes("CAC")) {
      const cac = platformApi.trackCACRequest(q);
      if (cac) {
        setTrackResult({
          found: true,
          type: "CAC",
          title: `CAC Registration: ${cac.proposedName1}`,
          status: cac.status,
          notes: cac.notes || "Filing in progress with Corporate Affairs Commission portal.",
        });
        return;
      }
    } else if (q.includes("ORD")) {
      const ord = platformApi.getOrderById(q);
      if (ord) {
        setTrackResult({
          found: true,
          type: "ORDER",
          title: `Order: ${ord.serviceTitle}`,
          status: ord.status,
          notes: `Total Amount: ₦${ord.totalAmount.toLocaleString()} (${ord.deliveryType})`,
        });
        return;
      }
    }

    setTrackResult({
      found: false,
      notes: `No active request found for reference "${quickTrackQuery}". Please verify and try again.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "SUCCESSFUL":
      case "READY_FOR_PICKUP":
      case "APPROVED_CERTIFICATE_READY":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200";
      case "PROCESSING":
      case "NAME_RESERVATION":
      case "DOCUMENT_VERIFICATION":
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200";
      case "PENDING":
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
    }
  };

  return (
    <DashboardLayout pageTitle="Welcome to Your Dashboard">
      <div className="space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Wallet Balance */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-body-color">Available Balance</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-dark dark:text-white tracking-tight">
                ₦{wallet.currentBalance.toLocaleString()}
              </h3>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stroke/60 dark:border-strokedark/60 text-xs">
                <span className="text-body-color">Ledger: ₦{wallet.ledgerBalance.toLocaleString()}</span>
                <Link href="/dashboard/wallet/fund" className="font-bold text-primary hover:underline">
                  + Fund Wallet
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-body-color">Total Orders</span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-dark dark:text-white tracking-tight">
                {orders.length}
              </h3>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stroke/60 dark:border-strokedark/60 text-xs">
                <span className="text-body-color">Active processing</span>
                <Link href="/dashboard/orders" className="font-bold text-primary hover:underline">
                  View All Orders
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Identity & CAC Inquiries */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-body-color">Identity & CAC Inquiries</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-dark dark:text-white tracking-tight">
                2 Active
              </h3>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stroke/60 dark:border-strokedark/60 text-xs">
                <span className="text-body-color">NIN & CAC tracking</span>
                <Link href="/dashboard/nin" className="font-bold text-primary hover:underline">
                  NIN Desk
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4: Academy Progress */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-body-color">Academy Enrolled</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-dark dark:text-white tracking-tight">
                1 Course
              </h3>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-stroke/60 dark:border-strokedark/60 text-xs">
                <span className="text-body-color">65% Progress</span>
                <Link href="/dashboard/academy" className="font-bold text-primary hover:underline">
                  Student Portal
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Services Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                Instant Service Launchpad
              </h2>
              <p className="text-xs text-body-color">
                Initiate utility top-ups, corporate filings, documentation, or inquiry requests
              </p>
            </div>
            <Link
              href="/dashboard/services"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Explore Catalogue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Shortcut 1 */}
            <Link
              href="/dashboard/services/airtime"
              className="p-4 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark hover:border-primary transition group text-center flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-dark dark:text-white">Buy Airtime</span>
              <span className="text-[10px] text-body-color">MTN, Glo, Airtel</span>
            </Link>

            {/* Shortcut 2 */}
            <Link
              href="/dashboard/services/data"
              className="p-4 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark hover:border-primary transition group text-center flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-dark dark:text-white">SME Data</span>
              <span className="text-[10px] text-body-color">Instant Bundles</span>
            </Link>

            {/* Shortcut 3 */}
            <Link
              href="/dashboard/services/electricity"
              className="p-4 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark hover:border-primary transition group text-center flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-dark dark:text-white">Electricity Token</span>
              <span className="text-[10px] text-body-color">DISCO Bill Pay</span>
            </Link>

            {/* Shortcut 4 */}
            <Link
              href="/dashboard/services/cable-tv"
              className="p-4 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark hover:border-primary transition group text-center flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Tv className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-dark dark:text-white">Cable TV</span>
              <span className="text-[10px] text-body-color">DSTV, GOtv, StarTimes</span>
            </Link>

            {/* Shortcut 5 */}
            <Link
              href="/dashboard/nin"
              className="p-4 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark hover:border-primary transition group text-center flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-dark dark:text-white">NIN Centre</span>
              <span className="text-[10px] text-body-color">Slip & Plastic Card</span>
            </Link>

            {/* Shortcut 6 */}
            <Link
              href="/dashboard/cac"
              className="p-4 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark hover:border-primary transition group text-center flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-dark dark:text-white">CAC Business</span>
              <span className="text-[10px] text-body-color">Enterprise & Ltd</span>
            </Link>
          </div>
        </div>

        {/* Live Quick Tracker Widget */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="max-w-2xl">
            <h3 className="text-sm sm:text-base font-bold text-dark dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Live Status Tracker
            </h3>
            <p className="text-xs text-body-color mt-1">
              Have an existing inquiry or order? Enter your reference number (e.g., HT-NIN-2026-8812, HT-CAC-2026-4402, or HT-ORD-2026-0081) to check current operational progress.
            </p>

            <form onSubmit={handleQuickTrack} className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={quickTrackQuery}
                onChange={(e) => setQuickTrackQuery(e.target.value)}
                placeholder="Enter Reference (e.g. HT-NIN-2026-8812)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-xs sm:text-sm text-dark dark:text-white focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary/90 transition shadow-sm shrink-0"
              >
                Check Status
              </button>
            </form>

            {trackResult && (
              <div className="mt-4 p-4 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark animate-in fade-in duration-200">
                {trackResult.found ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-dark dark:text-white">{trackResult.title}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(trackResult.status || "")}`}>
                        {trackResult.status}
                      </span>
                    </div>
                    <p className="text-xs text-body-color mt-1.5">{trackResult.notes}</p>
                  </div>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400">{trackResult.notes}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Two-Column Grid: Recent Orders & Recent Wallet Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders (2 Columns) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-dark dark:text-white">
                  Recent Orders
                </h3>
                <p className="text-xs text-body-color">Track fulfillments, receipts, and order statuses</p>
              </div>
              <Link
                href="/dashboard/orders"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                    <th className="pb-3 font-semibold">Order No.</th>
                    <th className="pb-3 font-semibold">Service</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/40">
                      <td className="py-3 font-medium text-dark dark:text-white">{ord.orderNumber}</td>
                      <td className="py-3">
                        <p className="font-semibold text-dark dark:text-white truncate max-w-[180px]">
                          {ord.serviceTitle}
                        </p>
                        <span className="text-[10px] text-body-color">{ord.serviceCategoryName}</span>
                      </td>
                      <td className="py-3 font-semibold text-dark dark:text-white">
                        ₦{ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/dashboard/orders/${ord.id}`}
                          className="font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Receipt</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions & Centre Desk Info (1 Column) */}
          <div className="space-y-6">
            {/* Wallet Activity */}
            <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-bold text-dark dark:text-white">
                  Wallet Transactions
                </h3>
                <Link
                  href="/dashboard/wallet/transactions"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  History
                </Link>
              </div>

              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-dark">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          tx.type === "WALLET_TOPUP"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {tx.type === "WALLET_TOPUP" ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-dark dark:text-white truncate max-w-[130px]">
                          {tx.description}
                        </p>
                        <span className="text-[10px] text-body-color">{tx.reference}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold ${
                          tx.type === "WALLET_TOPUP"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-dark dark:text-white"
                        }`}
                      >
                        {tx.type === "WALLET_TOPUP" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical Walk-in Support Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-dark dark:text-white mb-2">
                Physical Walk-in Hub
              </h4>
              <p className="text-xs text-body-color leading-relaxed">
                Visit our physical office for heavy-duty printing, scanning, lamination, typing, and in-person NIN desk assistance:
              </p>
              <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-dark rounded-xl text-xs space-y-1">
                <p className="font-semibold text-dark dark:text-white">{companyConfig.address}</p>
                <p className="text-body-color">Hours: {companyConfig.operatingHours}</p>
                <p className="text-primary font-bold">Tel: {companyConfig.phonePrimary}</p>
              </div>
              <a
                href={`https://wa.me/234${companyConfig.whatsapp.slice(1)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block text-center w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Chat on WhatsApp Desk
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
