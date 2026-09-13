"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { User, Wallet as UserWallet } from "@/types/platform";

interface WalletRow {
  id: string;
  user: User;
  wallet: UserWallet;
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletRow | null>(null);
  const [adjustType, setAdjustType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const loadWallets = () => {
    try {
      setLoading(true);
      const data = platformApi.getAllWallets();
      const rows: WalletRow[] = data.map((d) => ({
        id: d.wallet.id,
        user: d.user,
        wallet: d.wallet,
      }));
      setWallets(rows);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load wallets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;

    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (!adjustReason.trim()) return;

    setAdjusting(true);
    setTimeout(() => {
      platformApi.adjustWalletBalance(
        selectedWallet.user.id,
        amount,
        adjustType,
        adjustReason.trim()
      );
      setAdjusting(false);
      setShowAdjustModal(false);
      setAdjustAmount("");
      setAdjustReason("");
      loadWallets();
    }, 600);
  };

  const totalCurrent = wallets.reduce((sum, w) => sum + w.wallet.currentBalance, 0);
  const totalLedger = wallets.reduce((sum, w) => sum + w.wallet.ledgerBalance, 0);

  const columns: Column<WalletRow>[] = [
    {
      key: "user",
      header: "Account Holder",
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-bold text-dark dark:text-white text-xs">{r.user.fullName}</p>
          <p className="text-[11px] text-body-color">{r.user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Account Tier",
      sortable: true,
      render: (r) => (
        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-dark dark:text-white">
          {r.user.role}
        </span>
      ),
    },
    {
      key: "currentBalance",
      header: "Available Balance",
      sortable: true,
      align: "right",
      render: (r) => (
        <span className="font-mono text-xs font-bold text-dark dark:text-white">
          ₦{r.wallet.currentBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "ledgerBalance",
      header: "Ledger Balance",
      sortable: true,
      align: "right",
      render: (r) => (
        <span className="font-mono text-xs text-body-color">
          ₦{r.wallet.ledgerBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {r.wallet.status}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Activity",
      render: (r) => (
        <span className="text-xs text-body-color">
          {new Date(r.wallet.updatedAt).toLocaleDateString("en-NG")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <button
          type="button"
          onClick={() => {
            setSelectedWallet(r);
            setShowAdjustModal(true);
          }}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition shadow-sm"
        >
          Adjust Balance
        </button>
      ),
    },
  ];

  return (
    <AdminLayout
      pageTitle="Customer & Agent Wallets"
      breadcrumbs={[{ label: "Customer Wallets" }]}
    >
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Liquid User Funds</span>
            <p className="text-2xl font-bold text-dark dark:text-white mt-1">
              ₦{totalCurrent.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-body-color mt-1 block">Across {wallets.length} accounts</span>
          </div>

          <div className="p-5 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Ledger Total</span>
            <p className="text-2xl font-bold text-dark dark:text-white mt-1">
              ₦{totalLedger.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              100% In Reconciled State
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">System Escrow & Locked</span>
            <p className="text-2xl font-bold text-dark dark:text-white mt-1">₦0.00</p>
            <span className="text-[11px] text-body-color mt-1 block">Zero pending escrow hold</span>
          </div>
        </div>

        {/* Wallets Table */}
        <AdminDataTable
          columns={columns}
          data={wallets}
          loading={loading}
          error={error}
          onRetry={loadWallets}
          searchPlaceholder="Search by account holder name or email..."
          searchKeys={["user.fullName", "user.email"]}
          emptyTitle="No wallets found"
          emptyDescription="User wallets will automatically populate upon user sign-up."
        />

        {/* Adjust Modal */}
        {showAdjustModal && selectedWallet && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Admin Wallet Adjustment</h3>
                  <p className="text-xs text-body-color">{selectedWallet.user.fullName}</p>
                </div>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-dark rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-body-color">Current Balance:</span>
                    <span className="font-bold text-dark dark:text-white font-mono">
                      ₦{selectedWallet.wallet.currentBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-color">Account Role:</span>
                    <span className="font-bold uppercase text-primary">{selectedWallet.user.role}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Adjustment Direction
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAdjustType("CREDIT")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        adjustType === "CREDIT"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                          : "border-stroke dark:border-strokedark text-body-color"
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Credit (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType("DEBIT")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        adjustType === "DEBIT"
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                          : "border-stroke dark:border-strokedark text-body-color"
                      }`}
                    >
                      <MinusCircle className="w-4 h-4" />
                      <span>Debit (-)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Amount (₦ NGN)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Reason & Audit Narration
                  </label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Manual bank deposit settlement from Moniepoint POS"
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adjusting}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
                  >
                    {adjusting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Adjustment</span>
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
