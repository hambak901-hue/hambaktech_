"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  ShoppingBag,
  ArrowUpRight,
  FileSpreadsheet,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import platformApi from "@/lib/api-client";

interface ServiceReportItem {
  name: string;
  category: string;
  volume: number;
  revenue: number;
  providerCost: number;
  netMargin: number;
  marginPct: number;
}

const REPORT_DATA: ServiceReportItem[] = [
  {
    name: "MTN Data & VTU Airtime",
    category: "Telecom VTU",
    volume: 342,
    revenue: 485000,
    providerCost: 460750,
    netMargin: 24250,
    marginPct: 5.0,
  },
  {
    name: "Plastic PVC NIN Card Printing",
    category: "NIN Identity",
    volume: 128,
    revenue: 320000,
    providerCost: 166400,
    netMargin: 153600,
    marginPct: 48.0,
  },
  {
    name: "CAC Business Name Registration",
    category: "Corporate Affairs",
    volume: 14,
    revenue: 308000,
    providerCost: 210000,
    netMargin: 98000,
    marginPct: 31.8,
  },
  {
    name: "Computer Academy Enrollments",
    category: "Academy",
    volume: 6,
    revenue: 260000,
    providerCost: 52000,
    netMargin: 208000,
    marginPct: 80.0,
  },
  {
    name: "Business Centre (Print & Bind)",
    category: "Business Centre",
    volume: 215,
    revenue: 125000,
    providerCost: 43750,
    netMargin: 81250,
    marginPct: 65.0,
  },
];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "ytd">("30d");

  const totalRevenue = REPORT_DATA.reduce((s, i) => s + i.revenue, 0);
  const totalVolume = REPORT_DATA.reduce((s, i) => s + i.volume, 0);
  const totalMargin = REPORT_DATA.reduce((s, i) => s + i.netMargin, 0);

  const handleExportCSV = () => {
    const headers = ["Service Offering", "Category", "Transaction Volume", "Gross Revenue (NGN)", "Provider Cost (NGN)", "Net Margin (NGN)", "Margin %"];
    const rows = REPORT_DATA.map((i) => [
      `"${i.name}"`,
      `"${i.category}"`,
      i.volume,
      i.revenue,
      i.providerCost,
      i.netMargin,
      `${i.marginPct}%`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hambaktech-performance-report-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const data = {
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue,
        totalVolume,
        totalMargin,
        blendedMarginPct: ((totalMargin / totalRevenue) * 100).toFixed(1),
      },
      lineItems: REPORT_DATA,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hambaktech-financial-report-${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      pageTitle="Financial Analytics & Service Performance Reports"
      breadcrumbs={[{ label: "Financial Reports" }]}
      actionButton={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stroke dark:border-strokedark text-xs font-bold text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-body-color font-semibold">Reporting Period:</span>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {(["7d", "30d", "90d", "ytd"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                  period === p
                    ? "bg-white dark:bg-dark text-primary shadow-xs"
                    : "text-body-color hover:text-dark dark:hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Top Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs font-semibold text-body-color block">Gross Volume Generated</span>
            <p className="text-2xl font-black text-dark dark:text-white mt-1">
              ₦{totalRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% compared to previous cycle
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs font-semibold text-body-color block">Net Platform Gross Margin</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              ₦{totalMargin.toLocaleString()}
            </p>
            <span className="text-[11px] text-body-color font-semibold mt-2 block">
              Blended margin rate: {((totalMargin / totalRevenue) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs font-semibold text-body-color block">Total Service Orders</span>
            <p className="text-2xl font-black text-primary mt-1">
              {totalVolume.toLocaleString()} Orders
            </p>
            <span className="text-[11px] text-body-color font-semibold mt-2 block">
              Avg. Ticket: ₦{Math.round(totalRevenue / totalVolume).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Breakdown by Service Line */}
        <div className="bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stroke dark:border-strokedark flex items-center justify-between">
            <h3 className="text-sm font-bold text-dark dark:text-white">Service Line Performance Matrix</h3>
            <span className="text-xs font-mono text-body-color">5 Verticals Tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-dark border-b border-stroke dark:border-strokedark text-dark dark:text-white font-bold">
                <tr>
                  <th className="p-3.5">Service Offering</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-center">Volume</th>
                  <th className="p-3.5 text-right">Gross Revenue</th>
                  <th className="p-3.5 text-right">API / Direct Cost</th>
                  <th className="p-3.5 text-right">Net Margin</th>
                  <th className="p-3.5 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {REPORT_DATA.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/50">
                    <td className="p-3.5 font-bold text-dark dark:text-white">{item.name}</td>
                    <td className="p-3.5 text-body-color">{item.category}</td>
                    <td className="p-3.5 text-center font-mono font-semibold">{item.volume}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-dark dark:text-white">
                      ₦{item.revenue.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-mono text-body-color">
                      ₦{item.providerCost.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                      ₦{item.netMargin.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.marginPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
