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
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { NotificationItem } from "@/types/platform";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationItem["type"]>("ANNOUNCEMENT");
  const [actionUrl, setActionUrl] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

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
      setBroadcastSuccess(true);
      setTitle("");
      setMessage("");
      setActionUrl("");
      setTimeout(() => {
        setBroadcastSuccess(false);
        setShowBroadcastModal(false);
      }, 1200);
      loadNotifications();
    }, 600);
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
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
          n.read
            ? "bg-gray-100 text-body-color dark:bg-gray-800"
            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        }`}>
          {n.read ? "Read" : "Unread"}
        </span>
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
              <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Broadcast Customer Alert</h3>
                  <p className="text-xs text-body-color">Sends real-time in-app notification to all users</p>
                </div>
              </div>

              {broadcastSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Broadcast successfully transmitted!</span>
                </div>
              )}

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
      </div>
    </AdminLayout>
  );
}
