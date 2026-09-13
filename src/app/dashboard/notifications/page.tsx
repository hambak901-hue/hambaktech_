"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Package,
  ShieldCheck,
  Clock,
  Trash2,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { NotificationItem } from "@/types/platform";

export default function DashboardNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    platformApi.getNotifications()
  );
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    platformApi.markAllNotificationsAsRead();
    setNotifications(platformApi.getNotifications());
  };

  const handleMarkSingleRead = (id: string) => {
    platformApi.markNotificationAsRead(id);
    setNotifications(platformApi.getNotifications());
  };

  const filteredList =
    filter === "UNREAD" ? notifications.filter((n) => !n.read) : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case "ORDER":
        return <Package className="w-5 h-5 text-primary" />;
      case "SECURITY":
        return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <DashboardLayout
      pageTitle="Notifications & Activity Alerts"
      breadcrumbs={[{ label: "Notifications" }]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-dark dark:text-white">
                Notification Feed
              </h2>
              <p className="text-xs text-body-color">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
                  : "You're all caught up with your notifications!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter(filter === "ALL" ? "UNREAD" : "ALL")}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                filter === "UNREAD"
                  ? "border-primary bg-primary text-white"
                  : "border-stroke dark:border-strokedark text-dark dark:text-white hover:border-primary"
              }`}
            >
              {filter === "UNREAD" ? "Showing Unread" : "Show Unread Only"}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 rounded-xl border border-stroke dark:border-strokedark text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-dark text-body-color hover:text-dark dark:hover:text-white transition"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark">
              <Bell className="w-12 h-12 text-body-color/40 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-dark dark:text-white">No notifications</h3>
              <p className="text-xs text-body-color mt-1">
                You do not have any {filter === "UNREAD" ? "unread" : ""} alerts right now.
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.read && handleMarkSingleRead(item.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                  item.read
                    ? "bg-white dark:bg-dark border-stroke dark:border-strokedark hover:bg-gray-50/50 dark:hover:bg-gray-dark/50"
                    : "bg-primary/5 dark:bg-primary/10 border-primary/30 shadow-sm"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-dark shrink-0">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs sm:text-sm font-bold truncate ${
                        item.read ? "text-dark dark:text-white" : "text-primary dark:text-primary"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-body-color shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <p className="text-xs text-body-color mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  {item.actionUrl && (
                    <Link
                      href={item.actionUrl}
                      className="inline-block mt-2 text-xs font-bold text-primary hover:underline"
                    >
                      View Details →
                    </Link>
                  )}
                </div>

                {!item.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
