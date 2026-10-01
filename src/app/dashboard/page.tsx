"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet as WalletIcon,
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
import type { Order, Transaction, Wallet } from "@/types/platform";
import companyConfig from "@/data/companyConfig";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

export default function DashboardOverviewPage() {
  const [wallet, setWallet] = useState<Wallet>({
    id: "",
    userId: "",
    currency: "NGN",
    currentBalance: 0,
    ledgerBalance: 0,
    lockedBalance: 0,
    status: "ACTIVE",
    updatedAt: new Date().toISOString(),
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<{
    fullName: string;
    customerTier: string;
    kycStatus: string;
    kycTier: number;
  }>({
    fullName: "Valued Customer",
    customerTier: "STANDARD",
    kycStatus: "UNVERIFIED",
    kycTier: 1,
  });
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [quickTrackQuery, setQuickTrackQuery] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<{
    found: boolean;
    type?: "NIN" | "CAC" | "ORDER";
    title?: string;
    status?: string;
    notes?: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setDashboardError(null);
        const headers = getAuthHeaders();
        const [walletRes, ordersRes, txRes, profileRes] = await Promise.all([
          fetch(getApiUrl("/api/wallet"), { headers, credentials: "include" }),
          fetch(getApiUrl("/api/orders?limit=5"), { headers, credentials: "include" }),
          fetch(getApiUrl("/api/wallet/transactions?limit=5"), { headers, credentials: "include" }),
          fetch(getApiUrl("/api/profile"), { headers, credentials: "include" }),
        ]);

        if (walletRes.ok) {
          const wJson = await walletRes.json();
          if (wJson.success && wJson.data?.wallet && isMounted) {
            setWallet(wJson.data.wallet);
          }
        }

        if (ordersRes.ok) {
          const oJson = await ordersRes.json();
          if (oJson.success && oJson.data?.orders && isMounted) {
            setOrders(oJson.data.orders);
          }
        }

        if (txRes.ok) {
          const tJson = await txRes.json();
          if (tJson.success && tJson.data?.transactions && isMounted) {
            setTransactions(tJson.data.transactions);
          }
        }

        if (profileRes.ok) {
          const pJson = await profileRes.json();
          if (pJson.success && pJson.data && isMounted) {
            const p = pJson.data;
            const name = [p.first_name || p.firstName, p.last_name || p.lastName].filter(Boolean).join(" ");
            setProfile({
              fullName: name || "Valued Customer",
              customerTier: p.customer_tier || p.customerTier || "STANDARD",
              kycStatus: p.kyc_status || p.kycStatus || "UNVERIFIED",
              kycTier: Number(p.kyc_tier || p.kycTier || 1),
            });
          }
        }
      } catch (err) {
        console.warn("[DashboardOverview] Failed to load authoritative data:", err);
        if (isMounted) {
          setDashboardError("Unable to synchronize latest dashboard data. Please check your network connection.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackQuery.trim()) return;

    const q = quickTrackQuery.trim().toUpperCase();
    setTrackingLoading(true);
    setTrackResult(null);

    try {
      const headers = getAuthHeaders();
      if (q.includes("NIN") || q.startsWith("NIN-") || q.startsWith("V-NIN")) {
        const res = await fetch(getApiUrl(`/api/nin/track/${encodeURIComponent(q)}`), {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const nin = json.data;
            setTrackResult({
              found: true,
              type: "NIN",
              title: `NIN Service: ${(nin.serviceType || nin.service_type || "VERIFICATION").replace(/_/g, " ")}`,
              status: nin.status,
              notes: nin.notes || "Document processed through NIMC verification channels.",
            });
            return;
          }
        }
      } else if (q.includes("CAC") || q.startsWith("CAC-") || q.startsWith("RC-")) {
        const res = await fetch(getApiUrl(`/api/cac/track/${encodeURIComponent(q)}`), {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const cac = json.data;
            setTrackResult({
              found: true,
              type: "CAC",
              title: `CAC Registration: ${cac.proposedName1 || cac.proposed_name1 || "Enterprise"}`,
              status: cac.status,
              notes: cac.notes || "Filing in progress with Corporate Affairs Commission portal.",
            });
            return;
          }
        }
      } else {
        const res = await fetch(getApiUrl(`/api/orders/${encodeURIComponent(q)}`), {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.order) {
            const ord = json.data.order;
            setTrackResult({
              found: true,
              type: "ORDER",
              title: `Order: ${ord.serviceTitle || ord.title || ord.orderNumber}`,
              status: ord.status,
              notes: `Total Amount: ₦${Number(ord.totalAmount || ord.total_amount || 0).toLocaleString()} (${ord.deliveryType || "Digital"})`,
            });
            return;
          }
        }
      }

      setTrackResult({
        found: false,
        notes: `No active request found for reference "${quickTrackQuery}". Please verify and try again.`,
      });
    } catch {
      setTrackResult({
        found: false,
        notes: `Unable to verify reference "${quickTrackQuery}" at this time. Please check your network.`,
      });
    } finally {
      setTrackingLoading(false);
    }
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
        {/* Customer Status & KYC Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
              {profile.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-dark dark:text-white">
                  Good day, {profile.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/20">
                  {profile.customerTier} TIER
                </span>
              </div>
              <p className="text-xs text-body-color mt-0.5">
                Manage your digital orders, identity verification, wallet debits, and store purchases.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {profile.kycStatus === "VERIFIED" ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>KYC Tier {profile.kycTier} Verified</span>
              </span>
            ) : (
              <Link
                href="/dashboard/profile"
                className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-200 transition flex items-center gap-1.5 border border-amber-200 dark:border-amber-800"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KYC: {profile.kycStatus} • Upgrade Tier</span>
              </Link>
            )}
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Wallet Balance */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-body-color">Available Balance</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <WalletIcon className="w-4 h-4" />
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
              href="/dashboard/telecom"
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
              href="/dashboard/telecom?service=data"
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
              href="/dashboard/telecom?service=electricity"
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
