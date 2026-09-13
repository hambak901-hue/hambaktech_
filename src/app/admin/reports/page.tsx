"use client";

import React, { useState, useEffect } from "react";
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
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import platformApi from "@/lib/api-client";

interface ServiceReportItem {
  id: string;
  name: string;
  category: string;
  volume: number;
  revenue: number;
  providerCost: number;
  netMargin: number;
  marginPct: number;
}

const DEFAULT_REPORT_DATA: ServiceReportItem[] = [
  {
    id: "rep-1",
    name: "MTN Data & VTU Airtime",
    category: "Telecom VTU",
    volume: 342,
    revenue: 485000,
    providerCost: 460750,
    netMargin: 24250,
    marginPct: 5.0,
  },
  {
    id: "rep-2",
    name: "Plastic PVC NIN Card Printing",
    category: "NIN Identity",
    volume: 128,
    revenue: 320000,
    providerCost: 166400,
    netMargin: 153600,
    marginPct: 48.0,
  },
  {
    id: "rep-3",
    name: "CAC Business Name Registration",
    category: "Corporate Affairs",
    volume: 14,
    revenue: 308000,
    providerCost: 210000,
    netMargin: 98000,
    marginPct: 31.8,
  },
  {
    id: "rep-4",
    name: "Computer Academy Enrollments",
    category: "Academy",
    volume: 6,
    revenue: 260000,
    providerCost: 52000,
    netMargin: 208000,
    marginPct: 80.0,
  },
  {
    id: "rep-5",
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
  const [reportItems, setReportItems] = useState<ServiceReportItem[]>(DEFAULT_REPORT_DATA);
  const [feedback, setFeedback] = useState<string | null>(null);

  // CRUD Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceReportItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ServiceReportItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Telecom VTU",
    volume: 1,
    revenue: 1000,
    providerCost: 500,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ht_report_items");
      if (saved) {
        setReportItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveItems = (items: ServiceReportItem[]) => {
    setReportItems(items);
    try {
      localStorage.setItem("ht_report_items", JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const net = Math.max(0, formData.revenue - formData.providerCost);
    const pct = formData.revenue > 0 ? parseFloat(((net / formData.revenue) * 100).toFixed(1)) : 0;
    const newItem: ServiceReportItem = {
      id: `rep-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      volume: Number(formData.volume),
      revenue: Number(formData.revenue),
      providerCost: Number(formData.providerCost),
      netMargin: net,
      marginPct: pct,
    };

    saveItems([...reportItems, newItem]);
    platformApi.logAuditEvent("CREATE", "FINANCIAL_REPORT", newItem.id, "SUCCESS", `Added report item: ${newItem.name}`);
    setShowCreateModal(false);
    setFormData({ name: "", category: "Telecom VTU", volume: 1, revenue: 1000, providerCost: 500 });
    notify(`Report entry "${newItem.name}" added successfully.`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const net = Math.max(0, formData.revenue - formData.providerCost);
    const pct = formData.revenue > 0 ? parseFloat(((net / formData.revenue) * 100).toFixed(1)) : 0;

    const updated = reportItems.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            name: formData.name.trim(),
            category: formData.category,
            volume: Number(formData.volume),
            revenue: Number(formData.revenue),
            providerCost: Number(formData.providerCost),
            netMargin: net,
            marginPct: pct,
          }
        : item
    );

    saveItems(updated);
    platformApi.logAuditEvent("UPDATE", "FINANCIAL_REPORT", editingItem.id, "SUCCESS", `Updated report item: ${formData.name}`);
    setEditingItem(null);
    notify(`Report entry updated successfully.`);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    const updated = reportItems.filter((i) => i.id !== deletingItem.id);
    saveItems(updated);
    platformApi.logAuditEvent("DELETE", "FINANCIAL_REPORT", deletingItem.id, "SUCCESS", `Deleted report item: ${deletingItem.name}`);
    setDeletingItem(null);
    notify(`Report entry deleted.`);
  };

  const handleResetDefaults = () => {
    saveItems(DEFAULT_REPORT_DATA);
    platformApi.logAuditEvent("RESET", "FINANCIAL_REPORT", "all", "SUCCESS", "Reset financial reports to default baseline");
    notify("Reset reports to default system metrics.");
  };

  const totalRevenue = reportItems.reduce((s, i) => s + i.revenue, 0);
  const totalVolume = reportItems.reduce((s, i) => s + i.volume, 0);
  const totalMargin = reportItems.reduce((s, i) => s + i.netMargin, 0);

  const handleExportCSV = () => {
    const headers = ["Service Offering", "Category", "Transaction Volume", "Gross Revenue (NGN)", "Provider Cost (NGN)", "Net Margin (NGN)", "Margin %"];
    const rows = reportItems.map((i) => [
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
        blendedMarginPct: totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0,
      },
      lineItems: reportItems,
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
            onClick={() => {
              setFormData({ name: "", category: "Telecom VTU", volume: 10, revenue: 25000, providerCost: 15000 });
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stroke dark:border-strokedark text-xs font-bold text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stroke dark:border-strokedark text-xs font-bold text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Period Selector & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-body-color hover:text-primary flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>
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
              Blended margin rate: {totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0}%
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs font-semibold text-body-color block">Total Service Orders</span>
            <p className="text-2xl font-black text-primary mt-1">
              {totalVolume.toLocaleString()} Orders
            </p>
            <span className="text-[11px] text-body-color font-semibold mt-2 block">
              Avg. Ticket: ₦{totalVolume > 0 ? Math.round(totalRevenue / totalVolume).toLocaleString() : 0}
            </span>
          </div>
        </div>

        {/* Breakdown by Service Line */}
        <div className="bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stroke dark:border-strokedark flex items-center justify-between">
            <h3 className="text-sm font-bold text-dark dark:text-white">Service Line Performance Matrix</h3>
            <span className="text-xs font-mono text-body-color">{reportItems.length} Verticals Tracked</span>
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
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {reportItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/50">
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
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setFormData({
                              name: item.name,
                              category: item.category,
                              volume: item.volume,
                              revenue: item.revenue,
                              providerCost: item.providerCost,
                            });
                          }}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-primary transition"
                          title="Edit Entry"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-body-color hover:text-rose-600 transition"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <h3 className="text-base font-bold text-dark dark:text-white">Add Financial Metric / Entry</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Service Offering Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Bulk SMS Gateway"
                    className="w-full px-4 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="Telecom VTU">Telecom VTU</option>
                    <option value="NIN Identity">NIN Identity</option>
                    <option value="Corporate Affairs">Corporate Affairs</option>
                    <option value="Academy">Academy</option>
                    <option value="Business Centre">Business Centre</option>
                    <option value="Financial Services">Financial Services</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Volume</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Revenue (₦)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.revenue}
                      onChange={(e) => setFormData({ ...formData, revenue: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Cost (₦)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.providerCost}
                      onChange={(e) => setFormData({ ...formData, providerCost: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <h3 className="text-base font-bold text-dark dark:text-white">Edit Financial Report Item</h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Service Offering Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="Telecom VTU">Telecom VTU</option>
                    <option value="NIN Identity">NIN Identity</option>
                    <option value="Corporate Affairs">Corporate Affairs</option>
                    <option value="Academy">Academy</option>
                    <option value="Business Centre">Business Centre</option>
                    <option value="Financial Services">Financial Services</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Volume</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Revenue (₦)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.revenue}
                      onChange={(e) => setFormData({ ...formData, revenue: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Cost (₦)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.providerCost}
                      onChange={(e) => setFormData({ ...formData, providerCost: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Update Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-sm w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Report Entry</h3>
                  <p className="text-xs text-body-color">Are you sure you want to remove this line?</p>
                </div>
              </div>
              <p className="text-xs text-dark dark:text-white font-medium bg-gray-50 dark:bg-gray-dark p-3 rounded-xl">
                {deletingItem.name} ({deletingItem.category})
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

