"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  GraduationCap,
  Megaphone,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { NotificationItem } from "@/types/platform";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Broadcast / Create Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationItem["type"]>("ANNOUNCEMENT");
  const [actionUrl, setActionUrl] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  // Edit Modal State
  const [editingNotification, setEditingNotification] = useState<NotificationItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editType, setEditType] = useState<NotificationItem["type"]>("ANNOUNCEMENT");
  const [editActionUrl, setEditActionUrl] = useState("");
  const [editRead, setEditRead] = useState(false);

  // Delete Modal State
  const [deletingNotification, setDeletingNotification] = useState<NotificationItem | null>(null);

  const loadNotifications = () => {
    try {
      setLoading(true);
      const list = platformApi.getNotifications();
      setNotifications([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setBroadcasting(true);
    setTimeout(() => {
      platformApi.broadcastNotification(
        title.trim(),
        message.trim(),
        type,
        actionUrl.trim() || undefined
      );
      setBroadcasting(false);
      setTitle("");
      setMessage("");
      setActionUrl("");
      setShowBroadcastModal(false);
      setActionFeedback("Notification broadcast sent.");
      setTimeout(() => setActionFeedback(null), 3500);
      loadNotifications();
    }, 400);
  };

  const openEditModal = (n: NotificationItem) => {
    setEditingNotification(n);
    setEditTitle(n.title);
    setEditMessage(n.message);
    setEditType(n.type);
    setEditActionUrl(n.actionUrl || "");
    setEditRead(n.read);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification) return;

    try {
      platformApi.updateNotification(editingNotification.id, {
        title: editTitle.trim(),
        message: editMessage.trim(),
        type: editType,
        actionUrl: editActionUrl.trim() || undefined,
        read: editRead,
      });
      setEditingNotification(null);
      setActionFeedback("Notification updated successfully.");
      setTimeout(() => setActionFeedback(null), 3500);
      loadNotifications();
    } catch (err: any) {
      alert(err.message || "Failed to update notification");
    }
  };

  const handleDelete = () => {
    if (!deletingNotification) return;
    try {
      platformApi.deleteNotification(deletingNotification.id);
      setDeletingNotification(null);
      setActionFeedback("Notification deleted.");
      setTimeout(() => setActionFeedback(null), 3500);
      loadNotifications();
    } catch (err: any) {
      alert(err.message || "Failed to delete notification");
    }
  };

  const toggleReadStatus = (n: NotificationItem) => {
    platformApi.updateNotification(n.id, { read: !n.read });
    loadNotifications();
  };

  const columns: Column<NotificationItem>[] = [
    {
      key: "title",
      header: "Title & Notification Message",
      sortable: true,
      render: (n) => (
        <div>
          <span className="font-bold text-dark dark:text-white text-xs block">{n.title}</span>
          <span className="text-[11px] text-body-color line-clamp-1">{n.message}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Category",
      sortable: true,
      render: (n) => {
        const typeStyles: Record<string, string> = {
          ANNOUNCEMENT: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
          TRANSACTION: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          ORDER: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          SECURITY: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
          ACADEMY: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${typeStyles[n.type] || typeStyles.ANNOUNCEMENT}`}>
            {n.type}
          </span>
        );
      },
    },
    {
      key: "actionUrl",
      header: "Deep Link / Action",
      render: (n) =>
        n.actionUrl ? (
          <span className="text-xs font-mono text-primary truncate max-w-[140px] block">
            {n.actionUrl}
          </span>
        ) : (
          <span className="text-xs text-body-color">—</span>
        ),
    },
    {
      key: "read",
      header: "Status",
      sortable: true,
      render: (n) => (
        <button
          type="button"
          onClick={() => toggleReadStatus(n)}
          className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${
            n.read
              ? "bg-gray-100 text-body-color dark:bg-gray-800 hover:bg-gray-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200"
          }`}
          title="Click to toggle Read/Unread"
        >
          {n.read ? "Read" : "Unread"}
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      render: (n) => (
        <span className="text-xs text-body-color">
          {new Date(n.createdAt).toLocaleDateString("en-NG", { dateStyle: "short" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (n) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openEditModal(n)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit Notification"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingNotification(n)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Notification"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "type",
      label: "Type",
      options: [
        { label: "Announcement", value: "ANNOUNCEMENT" },
        { label: "Transaction", value: "TRANSACTION" },
        { label: "Order", value: "ORDER" },
        { label: "Security", value: "SECURITY" },
        { label: "Academy", value: "ACADEMY" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="System Broadcast & Customer Notifications"
      breadcrumbs={[{ label: "Notifications Hub" }]}
      actionButton={
        <button
          type="button"
          onClick={() => setShowBroadcastModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast Message</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Action feedback */}
        {actionFeedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Broadcasts</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{notifications.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Announcements</span>
            <p className="text-xl font-bold text-purple-600 mt-1">
              {notifications.filter((n) => n.type === "ANNOUNCEMENT").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Active Push Channels</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">In-App & Email</p>
          </div>
        </div>

        {/* Notifications Table */}
        <AdminDataTable
          columns={columns}
          data={notifications}
          loading={loading}
          error={error}
          onRetry={loadNotifications}
          searchPlaceholder="Search notification title or message content..."
          searchKeys={["title", "message", "type"]}
          filters={filters}
          emptyTitle="No notifications broadcast"
          emptyDescription="Click 'Broadcast Message' above to send your first alert to customers."
        />

        {/* Broadcast Modal */}
        {showBroadcastModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Broadcast Customer Alert</h3>
                    <p className="text-xs text-body-color">Sends real-time in-app notification to users</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Notification Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as NotificationItem["type"])}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="ANNOUNCEMENT">Announcement / Promotion</option>
                    <option value="SECURITY">Security Advisory</option>
                    <option value="ORDER">Service / Order Fulfillment</option>
                    <option value="ACADEMY">Academy & Training</option>
                    <option value="TRANSACTION">Wallet & Billing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Express Plastic NIN Cards Now Live"
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. You can now request your verified plastic PVC card directly from your dashboard with same-day pickup."
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Action URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="/dashboard/nin"
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit Alert</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Notification Modal */}
        {editingNotification && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit Notification</h3>
                    <p className="text-xs text-body-color">Update broadcast content or state</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingNotification(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Notification Category
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as NotificationItem["type"])}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="ANNOUNCEMENT">Announcement / Promotion</option>
                    <option value="SECURITY">Security Advisory</option>
                    <option value="ORDER">Service / Order Fulfillment</option>
                    <option value="ACADEMY">Academy & Training</option>
                    <option value="TRANSACTION">Wallet & Billing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    rows={3}
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    required
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Action URL
                  </label>
                  <input
                    type="text"
                    value={editActionUrl}
                    onChange={(e) => setEditActionUrl(e.target.value)}
                    placeholder="/dashboard/..."
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editReadCheckbox"
                    checked={editRead}
                    onChange={(e) => setEditRead(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="editReadCheckbox" className="text-xs font-medium text-dark dark:text-white cursor-pointer">
                    Mark as Read by Default
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingNotification(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
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

        {/* Delete Notification Modal */}
        {deletingNotification && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Notification</h3>
                  <p className="text-xs text-body-color">Removal of broadcast notice</p>
                </div>
              </div>

              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete broadcast notice &ldquo;<strong className="text-dark dark:text-white">{deletingNotification.title}</strong>&rdquo;? Customers will no longer receive or view this notice.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingNotification(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

