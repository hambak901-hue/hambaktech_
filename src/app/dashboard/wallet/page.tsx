"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Building,
  Shield,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { Wallet, Transaction } from "@/types/platform";

export default function CustomerWalletPage() {
  const [wallet, setWallet] = useState<Wallet>(platformApi.getWallet());
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setWallet(platformApi.getWallet());
    setTransactions(platformApi.getTransactions().slice(0, 10));
  }, []);

  return (
    <DashboardLayout
      pageTitle="Digital Wallet & Financial Ledger"
      breadcrumbs={[{ label: "Wallet" }]}
    >
      <div className="space-y-8">
        {/* Wallet Overview Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
                <Shield className="w-3.5 h-3.5" />
                <span>Protected Double-Entry Ledger System</span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 font-medium uppercase tracking-wider">
                Available Wallet Balance
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-1">
                ₦{wallet.currentBalance.toLocaleString()}
              </h2>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/90">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                  <span>Ledger Balance:</span>
                  <strong className="text-white">₦{wallet.ledgerBalance.toLocaleString()}</strong>
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                  <span>Locked Balance:</span>
                  <strong className="text-white">₦{wallet.lockedBalance.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/wallet/fund"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-primary hover:bg-white/90 font-bold text-sm shadow-md transition transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Fund Wallet</span>
              </Link>
              <Link
                href="/dashboard/wallet/transactions"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm backdrop-blur-md transition"
              >
                <FileText className="w-4 h-4" />
                <span>Full Statement</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Informative Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-dark dark:text-white">Multiple Payment Options</h4>
              <p className="text-xs text-body-color mt-1">
                Fund via instant card debit (Paystack, Flutterwave), direct bank transfer, or over-the-counter at our centre.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-dark dark:text-white">Zero Extra Fees on Bill Pay</h4>
              <p className="text-xs text-body-color mt-1">
                Pay for airtime, data packages, electricity tokens, and student registrations seamlessly with wallet credits.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-dark dark:text-white">Audit & Requery Security</h4>
              <p className="text-xs text-body-color mt-1">
                Every transaction maintains an immutable reference and audit trail for automated reconciliation.
              </p>
            </div>
          </div>
        </div>

        {/* Ledger & Transactions Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Recent Ledger Transactions</h3>
              <p className="text-xs text-body-color">All credits and debits linked to your HambakTech wallet</p>
            </div>
            <Link
              href="/dashboard/wallet/transactions"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View Full Transaction History →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                  <th className="pb-3 font-semibold">Reference</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/40">
                    <td className="py-3.5 font-medium text-dark dark:text-white">{tx.reference}</td>
                    <td className="py-3.5">
                      <p className="font-semibold text-dark dark:text-white">{tx.description}</p>
                      <span className="text-[10px] text-body-color">{tx.type}</span>
                    </td>
                    <td className="py-3.5 text-body-color">{tx.paymentMethod}</td>
                    <td className="py-3.5 font-bold">
                      <span
                        className={
                          tx.type === "WALLET_TOPUP"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-dark dark:text-white"
                        }
                      >
                        {tx.type === "WALLET_TOPUP" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-body-color">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
