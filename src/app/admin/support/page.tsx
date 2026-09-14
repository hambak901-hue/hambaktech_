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
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { SupportTicket } from "@/types/platform";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<SupportTicket | null>(null);

  // Reply Thread State
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Create Form State
  const [createUserName, setCreateUserName] = useState("");
  const [createUserEmail, setCreateUserEmail] = useState("");
  const [createSubject, setCreateSubject] = useState("");
  const [createCategory, setCreateCategory] = useState<SupportTicket["category"]>("WALLET_FUNDING");
  const [createPriority, setCreatePriority] = useState<SupportTicket["priority"]>("MEDIUM");
  const [createMessage, setCreateMessage] = useState("");

  // Edit Form State
  const [editSubject, setEditSubject] = useState("");
  const [editCategory, setEditCategory] = useState<SupportTicket["category"]>("WALLET_FUNDING");
  const [editPriority, setEditPriority] = useState<SupportTicket["priority"]>("MEDIUM");
  const [editStatus, setEditStatus] = useState<SupportTicket["status"]>("OPEN");
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");

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

  const openCreateModal = () => {
    setCreateUserName("");
    setCreateUserEmail("");
    setCreateSubject("");
    setCreateCategory("WALLET_FUNDING");
    setCreatePriority("MEDIUM");
    setCreateMessage("");
    setShowCreateModal(true);
  };

  const openEditModal = (t: SupportTicket) => {
    setEditingTicket(t);
    setEditSubject(t.subject);
    setEditCategory(t.category);
    setEditPriority(t.priority);
    setEditStatus(t.status);
    setEditUserName(t.userName);
    setEditUserEmail(t.userEmail);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createSubject.trim() || !createMessage.trim()) return;

    try {
      platformApi.createSupportTicket({
        category: createCategory,
        subject: createSubject.trim(),
        priority: createPriority,
        initialMessage: createMessage.trim(),
      });
      setShowCreateModal(false);
      setActionFeedback("Support ticket created.");
      setTimeout(() => setActionFeedback(null), 3500);
      loadTickets();
    } catch (err: any) {
      alert(err.message || "Failed to create support ticket");
    }
  };

  const handleUpdateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    try {
      platformApi.updateTicket(editingTicket.id, {
        subject: editSubject.trim(),
        category: editCategory,
        priority: editPriority,
        status: editStatus,
        userName: editUserName.trim() || editingTicket.userName,
        userEmail: editUserEmail.trim() || editingTicket.userEmail,
      });
      setEditingTicket(null);
      setActionFeedback(`Ticket ${editingTicket.ticketNumber} updated.`);
      setTimeout(() => setActionFeedback(null), 3500);
      loadTickets();
    } catch (err: any) {
      alert(err.message || "Failed to update ticket");
    }
  };

  const handleDeleteTicket = () => {
    if (!deletingTicket) return;
    try {
      platformApi.deleteTicket(deletingTicket.id);
      setDeletingTicket(null);
      setActionFeedback(`Ticket ${deletingTicket.ticketNumber} deleted.`);
      setTimeout(() => setActionFeedback(null), 3500);
      loadTickets();
    } catch (err: any) {
      alert(err.message || "Failed to delete ticket");
    }
  };

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
    }, 400);
  };

  const handleQuickStatusChange = (status: SupportTicket["status"]) => {
    if (!selectedTicket) return;
    const updated = platformApi.updateTicket(selectedTicket.id, { status });
    if (updated) {
      setSelectedTicket({ ...updated });
    }
    loadTickets();
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
      header: "Actions",
      align: "right",
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedTicket(t)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition shadow-sm"
            title="Open Thread"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
          <button
            type="button"
            onClick={() => openEditModal(t)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit Ticket"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingTicket(t)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Ticket"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
        {/* Top Header & New Ticket Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white">Customer Support & Escalations</h2>
            <p className="text-xs text-body-color">Manage customer inquiries, dispute investigations, and agent communications.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Support Ticket</span>
          </button>
        </div>

        {/* Action feedback */}
        {actionFeedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionFeedback}</span>
          </div>
        )}

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

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Create Support Ticket</h3>
                    <p className="text-xs text-body-color">Log internal ticket or customer escalation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Category *</label>
                    <select
                      value={createCategory}
                      onChange={(e) => setCreateCategory(e.target.value as SupportTicket["category"])}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="WALLET_FUNDING">Wallet & Billing</option>
                      <option value="TECHNICAL">Technical Issue</option>
                      <option value="NIN_DESK">NIN Support Desk</option>
                      <option value="CAC_REGISTRATION">CAC Registration</option>
                      <option value="VTU_BILLS">VTU & Bill Payments</option>
                      <option value="ORDERS">Orders & Deliveries</option>
                      <option value="ACADEMY">Academy & Training</option>
                      <option value="PRINTING_CENTRE">Business Centre & Printing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Priority</label>
                    <select
                      value={createPriority}
                      onChange={(e) => setCreatePriority(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wallet funding delayed via Paystack"
                    value={createSubject}
                    onChange={(e) => setCreateSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Initial Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about the issue or request..."
                    value={createMessage}
                    onChange={(e) => setCreateMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
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
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Ticket Modal */}
        {editingTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit Support Ticket</h3>
                    <p className="text-xs text-body-color">{editingTicket.ticketNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTicket(null)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateTicket} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="WAITING_ON_CUSTOMER">WAITING_ON_CUSTOMER</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as SupportTicket["category"])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="WALLET_FUNDING">Wallet & Billing</option>
                    <option value="TECHNICAL">Technical Issue</option>
                    <option value="NIN_DESK">NIN Support Desk</option>
                    <option value="CAC_REGISTRATION">CAC Registration</option>
                    <option value="VTU_BILLS">VTU & Bill Payments</option>
                    <option value="ORDERS">Orders & Deliveries</option>
                    <option value="ACADEMY">Academy & Training</option>
                    <option value="PRINTING_CENTRE">Business Centre & Printing</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={editUserEmail}
                      onChange={(e) => setEditUserEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingTicket(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Ticket Modal */}
        {deletingTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Ticket</h3>
                  <p className="text-xs text-body-color">Removal of ticket record and messages</p>
                </div>
              </div>

              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to permanently delete ticket <strong className="text-dark dark:text-white">{deletingTicket.ticketNumber}</strong> ({deletingTicket.subject})? This thread cannot be recovered.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingTicket(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTicket}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-body-color font-semibold">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleQuickStatusChange(e.target.value as any)}
                      className="px-2 py-0.5 text-xs font-bold rounded-lg border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="WAITING_ON_CUSTOMER">WAITING_ON_CUSTOMER</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50/50 dark:bg-gray-dark/40 rounded-xl border border-stroke/50 dark:border-strokedark/50 min-h-[160px]">
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

