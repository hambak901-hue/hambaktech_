"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { Transaction } from "@/types/platform";

export default function WalletTransactionsHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchTx() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedType !== "ALL") queryParams.append("type", selectedType);
        if (selectedStatus !== "ALL") queryParams.append("status", selectedStatus);
        queryParams.append("limit", "50");

        const res = await fetch(`/api/v1/wallet/transactions?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.transactions && isMounted) {
            let list = data.data.transactions;
            if (search.trim()) {
              const q = search.toLowerCase();
              list = list.filter((t: any) =>
                t.reference?.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q)
              );
            }
            setTransactions(list);
            return;
          }
        }
      } catch (err) {
        console.warn("[WalletTransactions] Falling back to client cache:", err);
      } finally {
        if (isMounted) setLoading(false);
      }

      if (isMounted) {
        const list = platformApi.getTransactions({
          type: selectedType,
          status: selectedStatus,
          search,
        });
        setTransactions(list);
      }
    }

    fetchTx();
    return () => {
      isMounted = false;
    };
  }, [search, selectedType, selectedStatus]);

  const loadTransactions = () => {
    const list = platformApi.getTransactions({
      type: selectedType,
      status: selectedStatus,
      search,
    });
    setTransactions(list);
  };

  const handleExportCSV = () => {
    const headers = ["Reference", "Type", "Amount", "Fee", "Method", "Status", "Description", "Date"];
    const rows = transactions.map((t) => [
      t.reference,
      t.type,
      t.amount,
      t.fee,
      t.paymentMethod,
      t.status,
      `"${t.description.replace(/"/g, '""')}"`,
      t.createdAt,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HambakTech_Statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout
      pageTitle="Transaction History & Ledger"
      breadcrumbs={[
        { label: "Wallet", href: "/dashboard/wallet" },
        { label: "Transactions" },
      ]}
    >
      <div className="space-y-6">
        {/* Top Controls Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-body-color absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, recipient or description..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            {/* Filters and Export */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Transaction Types</option>
                <option value="WALLET_TOPUP">Wallet Top-up</option>
                <option value="VTU_AIRTIME">Airtime Recharge</option>
                <option value="VTU_DATA">Data Top-up</option>
                <option value="ELECTRICITY_BILL">Electricity Token</option>
                <option value="CABLE_TV">Cable TV Renewal</option>
                <option value="CAC_SERVICE">CAC Corporate Service</option>
                <option value="NIN_SERVICE">NIN Desk Service</option>
                <option value="ORDER_PAYMENT">General Order Payment</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESSFUL">Successful</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark text-dark dark:text-white transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                    <th className="pb-3 font-semibold">Reference</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Channel</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Fee</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/40">
                      <td className="py-3.5 font-medium text-dark dark:text-white">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center ${
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
                          <span>{tx.reference}</span>
                        </div>
                      </td>
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
                      <td className="py-3.5 text-body-color">
                        {tx.fee > 0 ? `₦${tx.fee.toLocaleString()}` : "₦0"}
                      </td>
                      <td className="py-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-body-color">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <FileText className="w-12 h-12 text-body-color/40 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-dark dark:text-white">No transactions found</h4>
              <p className="text-xs text-body-color mt-1">
                Try adjusting your search criteria or filter options.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
