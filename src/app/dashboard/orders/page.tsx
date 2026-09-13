"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  FileCheck,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { Order, OrderStatus } from "@/types/platform";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    const list = platformApi.getOrders({
      status: selectedStatus,
      search,
    });
    setOrders(list);
  }, [search, selectedStatus]);

  const loadOrders = () => {
    const list = platformApi.getOrders({
      status: selectedStatus,
      search,
    });
    setOrders(list);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200";
      case "PENDING":
      case "AWAITING_INPUT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
    }
  };

  return (
    <DashboardLayout
      pageTitle="My Orders & Service Requests"
      breadcrumbs={[{ label: "Orders" }]}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-body-color absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Order #, service name, or category..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Order Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="AWAITING_INPUT">Awaiting Input</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>

              <Link
                href="/dashboard/services"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
              >
                <span>New Service Order</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                    <th className="pb-3 font-semibold">Order Number</th>
                    <th className="pb-3 font-semibold">Service Description</th>
                    <th className="pb-3 font-semibold">Fulfillment Mode</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Receipt / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-dark/40">
                      <td className="py-4 font-bold text-dark dark:text-white">
                        {ord.orderNumber}
                      </td>
                      <td className="py-4">
                        <p className="font-semibold text-dark dark:text-white">{ord.serviceTitle}</p>
                        <span className="text-[10px] text-body-color">{ord.serviceCategoryName}</span>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-dark text-[10px] font-medium text-body-color">
                          {ord.deliveryType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-dark dark:text-white">
                        ₦{ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href={`/dashboard/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                        >
                          <span>View Receipt</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-body-color/40 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-dark dark:text-white">No orders matching criteria</h4>
              <p className="text-xs text-body-color mt-1">
                You can browse our service catalogue and place your first service request.
              </p>
              <Link
                href="/dashboard/services"
                className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
              >
                Browse Service Catalogue
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
