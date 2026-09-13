"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  User,
  Shield,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { SupportTicket } from "@/types/platform";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const loadTickets = () => {
    try {
      setLoading(true);
      const list = platformApi.getSupportTickets();
      setTickets([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyContent.trim()) return;

    setSendingReply(true);
    setTimeout(() => {
      const updated = platformApi.replyToSupportTicket(selectedTicket.id, replyContent.trim());
      setSendingReply(false);
      setReplyContent("");
      if (updated) {
        setSelectedTicket({ ...updated });
      }
      loadTickets();
    }, 500);
  };

  const columns: Column<SupportTicket>[] = [
    {
      key: "ticketNumber",
      header: "Ticket # & Priority",
      sortable: true,
      render: (t) => {
        const pColors: Record<string, string> = {
          URGENT: "text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200",
          HIGH: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200",
          MEDIUM: "text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200",
          LOW: "text-gray-700 bg-gray-50 dark:bg-gray-800 border-gray-200",
        };
        return (
          <div>
            <span className="font-mono text-xs font-bold text-dark dark:text-white block">
              {t.ticketNumber}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${pColors[t.priority] || pColors.LOW}`}>
              {t.priority}
            </span>
          </div>
        );
      },
    },
    {
      key: "subject",
      header: "Subject & Inquiry",
      sortable: true,
      render: (t) => (
        <div className="max-w-xs">
          <p className="font-bold text-xs text-dark dark:text-white truncate">{t.subject}</p>
          <span className="text-[11px] text-body-color">{t.messages.length} message(s)</span>
        </div>
      ),
    },
    {
      key: "userName",
      header: "Customer",
      sortable: true,
      render: (t) => (
        <div>
          <p className="font-bold text-dark dark:text-white text-xs">{t.userName}</p>
          <p className="text-[11px] text-body-color">{t.userEmail}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (t) => (
        <span className="text-xs font-semibold text-body-color">
          {t.category.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Desk Status",
      sortable: true,
      render: (t) => {
        const colors: Record<string, string> = {
          OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
          WAITING_ON_CUSTOMER: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
          RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${colors[t.status] || colors.OPEN}`}>
            {t.status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "updatedAt",
      header: "Last Update",
      sortable: true,
      render: (t) => (
        <span className="text-xs text-body-color">
          {new Date(t.updatedAt).toLocaleDateString("en-NG", { dateStyle: "short" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thread",
      align: "right",
      render: (t) => (
        <button
          type="button"
          onClick={() => setSelectedTicket(t)}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Reply</span>
        </button>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Open", value: "OPEN" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Waiting On Customer", value: "WAITING_ON_CUSTOMER" },
        { label: "Resolved", value: "RESOLVED" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { label: "Urgent", value: "URGENT" },
        { label: "High", value: "HIGH" },
        { label: "Medium", value: "MEDIUM" },
        { label: "Low", value: "LOW" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="Support Tickets & Inquiries Desk"
      breadcrumbs={[{ label: "Support Tickets" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Tickets</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{tickets.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Open / In Progress</span>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Awaiting Customer</span>
            <p className="text-xl font-bold text-purple-600 mt-1">
              {tickets.filter((t) => t.status === "WAITING_ON_CUSTOMER").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Resolved</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {tickets.filter((t) => t.status === "RESOLVED").length}
            </p>
          </div>
        </div>

        {/* Tickets Table */}
        <AdminDataTable
          columns={columns}
          data={tickets}
          loading={loading}
          error={error}
          onRetry={loadTickets}
          searchPlaceholder="Search ticket #, subject, customer, or email..."
          searchKeys={["ticketNumber", "subject", "userName", "userEmail"]}
          filters={filters}
          emptyTitle="No support tickets found"
          emptyDescription="Customer tickets created from the support desk will appear here."
        />

        {/* Reply / Conversation Thread Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-xl w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div>
                  <span className="text-xs uppercase font-bold text-primary">
                    Ticket #{selectedTicket.ticketNumber} • {selectedTicket.category}
                  </span>
                  <h3 className="text-base font-bold text-dark dark:text-white">
                    {selectedTicket.subject}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  ✕
                </button>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50/50 dark:bg-gray-dark/40 rounded-xl border border-stroke/50 dark:border-strokedark/50">
                {selectedTicket.messages.map((m) => {
                  const isAdmin = m.senderRole === "admin";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-body-color">
                        {isAdmin ? <Shield className="w-3 h-3 text-primary" /> : <User className="w-3 h-3 text-body-color" />}
                        <span className="font-bold text-dark dark:text-white">{m.senderName}</span>
                        <span>({m.senderRole})</span>
                        <span>•</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-md ${
                          isAdmin
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-white dark:bg-dark border border-stroke dark:border-strokedark text-dark dark:text-white rounded-tl-none shadow-xs"
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={3}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type official HambakTech administrative response..."
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-body-color">
                    Replying will automatically notify the customer.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={sendingReply || !replyContent.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                    >
                      {sendingReply ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
