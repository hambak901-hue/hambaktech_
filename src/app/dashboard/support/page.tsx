"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Send,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { SupportTicket } from "@/types/platform";
import companyConfig from "@/data/companyConfig";

export default function DashboardSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(platformApi.getTickets());
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("VTU_BILLS");
  const [priority, setPriority] = useState<any>("MEDIUM");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      alert("Please provide a subject and message description");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const t = platformApi.createTicket({
          subject,
          category,
          priority,
          message,
        });

        setTickets(platformApi.getTickets());
        setLoading(false);
        setShowModal(false);
        setSubject("");
        setMessage("");
        alert(`Support Ticket created successfully! Ticket No: ${t.ticketNumber}`);
      } catch (err: any) {
        setLoading(false);
        alert(err.message || "Failed to create ticket");
      }
    }, 800);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200";
      case "OPEN":
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200";
    }
  };

  return (
    <DashboardLayout
      pageTitle="Support Tickets & Help Desk"
      breadcrumbs={[{ label: "Support" }]}
    >
      <div className="space-y-6">
        {/* Support Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <LifeBuoy className="w-4 h-4" />
              <span>Customer Help & Resolution Desk</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              Support Center & Inquiries
            </h2>
            <p className="text-xs sm:text-sm text-body-color mt-1 max-w-xl">
              Submit resolution tickets for transaction discrepancies, token generation issues, or identity filings. Our support team responds within 1–2 hours during business hours.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary/90 transition shadow-md shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              <span>Open New Ticket</span>
            </button>
          </div>
        </div>

        {/* Direct Contact Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href={`https://wa.me/234${companyConfig.whatsapp.slice(1)}`}
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between hover:border-emerald-500 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400">
                  Instant Messaging
                </span>
                <p className="text-xs font-bold text-dark dark:text-white">WhatsApp Live Desk</p>
                <p className="text-[11px] text-body-color">{companyConfig.whatsapp}</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
          </a>

          <a
            href={`mailto:${companyConfig.email}`}
            className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 flex items-center justify-between hover:border-blue-500 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-400">
                  Official Inquiries
                </span>
                <p className="text-xs font-bold text-dark dark:text-white">Email Desk</p>
                <p className="text-[11px] text-body-color">{companyConfig.email}</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition" />
          </a>

          <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-800 dark:text-purple-400">
                  Physical Walk-In
                </span>
                <p className="text-xs font-bold text-dark dark:text-white">Ibeju-Lekki Hub</p>
                <p className="text-[11px] text-body-color">{companyConfig.operatingHours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <h3 className="text-base font-bold text-dark dark:text-white mb-4">
            Your Support Tickets ({tickets.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                  <th className="pb-3 font-semibold">Ticket No.</th>
                  <th className="pb-3 font-semibold">Subject & Description</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Priority</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {tickets.map((tk) => (
                  <tr key={tk.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/40">
                    <td className="py-3.5 font-mono font-bold text-primary dark:text-primary">
                      {tk.ticketNumber}
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-dark dark:text-white">{tk.subject}</p>
                      <span className="text-[10px] text-body-color line-clamp-1">{tk.message}</span>
                    </td>
                    <td className="py-3.5 text-body-color">{tk.category.replace(/_/g, " ")}</td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tk.priority === "HIGH" || tk.priority === "URGENT"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {tk.priority}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          tk.status
                        )}`}
                      >
                        {tk.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-body-color">
                      {new Date(tk.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: New Ticket */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                    Submit Resolution Ticket
                  </h3>
                  <p className="text-xs text-body-color">We will attend to your request promptly</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Electricity token not received on meter"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white"
                    >
                      <option value="VTU_BILLS">VTU & Bill Payments</option>
                      <option value="WALLET_FUNDING">Wallet & Billing</option>
                      <option value="NIN_DESK">NIN Support Desk</option>
                      <option value="CAC_REGISTRATION">CAC Registration</option>
                      <option value="ACADEMY">Academy Inquiries</option>
                      <option value="PRINTING_CENTRE">Business Centre Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                    Detailed Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Please include any relevant order references, phone numbers, or meter numbers..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-3 border-t border-stroke dark:border-strokedark flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-stroke dark:border-strokedark font-semibold text-dark dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <span>Open Ticket</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
