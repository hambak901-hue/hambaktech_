"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Building2,
  Tv,
  GraduationCap,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";

export default function AdminReportsPage() {
  const orders = platformApi.getOrders();
  const [period, setPeriod] = useState<"MONTH" | "QUARTER" | "YEAR">("MONTH");

  const totalVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const serviceBreakdown = [
    {
      category: "NIN Support Desk & PVC Cards",
      revenue: 42000,
      share: 36,
      icon: ShieldCheck,
      color: "bg-emerald-500",
    },
    {
      category: "CAC Business Filings",
      revenue: 55000,
      share: 47,
      icon: Building2,
      color: "bg-indigo-500",
    },
    {
      category: "VTU Data & Airtime",
      revenue: 9500,
      share: 8,
      icon: Zap,
      color: "bg-amber-500",
    },
    {
      category: "Electricity & Cable TV Bills",
      revenue: 10500,
      share: 9,
      icon: Tv,
      color: "bg-blue-500",
    },
  ];

  const handleExportCSV = () => {
    alert("Exporting transactional ledger report to CSV format...");
  };

  return (
    <DashboardLayout
      pageTitle="Business Intelligence & Operational Reports"
      breadcrumbs={[
        { label: "Admin Console", href: "/admin" },
        { label: "Reports & Analytics" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <BarChart3 className="w-4 h-4" />
              <span>Financial & Service Analytics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              Revenue & Performance Ledger
            </h2>
            <p className="text-xs text-body-color mt-0.5">
              Comprehensive breakdown of retail transactions, service desk volume, and profitability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-gray-dark border border-stroke dark:border-strokedark text-xs">
              {(["MONTH", "QUARTER", "YEAR"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    period === p
                      ? "bg-white dark:bg-dark text-primary shadow-sm"
                      : "text-body-color hover:text-dark dark:hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark hover:border-primary text-dark dark:text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-primary" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-body-color">
              Aggregate Revenue
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-white mt-2">
              ₦{(totalVolume + 117000).toLocaleString()}
            </h3>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last reporting cycle</span>
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-body-color">
              Successful Transactions
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-white mt-2">
              99.4%
            </h3>
            <span className="text-xs text-body-color mt-1 block">
              1,248 API switch calls completed
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-body-color">
              Average Order Value
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-white mt-2">
              ₦6,850
            </h3>
            <span className="text-xs text-body-color mt-1 block">
              Driven by CAC filings & PVC cards
            </span>
          </div>
        </div>

        {/* Service Share Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <h3 className="text-base font-bold text-dark dark:text-white mb-6">
            Revenue Composition by Department
          </h3>

          <div className="space-y-5">
            {serviceBreakdown.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="font-bold text-dark dark:text-white">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-dark dark:text-white mr-3">
                        ₦{item.revenue.toLocaleString()}
                      </span>
                      <span className="text-body-color font-medium">({item.share}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-dark overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
