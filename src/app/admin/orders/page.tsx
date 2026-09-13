"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Eye,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { Order, OrderStatus } from "@/types/platform";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>("COMPLETED");
  const [statusNote, setStatusNote] = useState("");

  const loadOrders = () => {
    try {
      setLoading(true);
      const list = platformApi.getOrders();
      setOrders(list);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrder) {
      platformApi.updateOrderStatus(selectedOrder.id, newStatus, statusNote);
      setShowStatusModal(false);
      setStatusNote("");
      loadOrders();
    }
  };

  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      header: "Order Reference",
      sortable: true,
      render: (o) => (
        <div>
          <span className="font-mono text-xs font-bold text-dark dark:text-white block">
            {o.orderNumber}
          </span>
          <span className="text-[11px] text-body-color">{o.deliveryType}</span>
        </div>
      ),
    },
    {
      key: "userName",
      header: "Customer",
      sortable: true,
      render: (o) => (
        <div>
          <p className="font-bold text-dark dark:text-white text-xs">{o.userName}</p>
          <p className="text-[11px] text-body-color">{o.userEmail}</p>
        </div>
      ),
    },
    {
      key: "serviceTitle",
      header: "Service & Category",
      render: (o) => (
        <div className="max-w-xs">
          <p className="text-xs font-semibold text-dark dark:text-white truncate">{o.serviceTitle}</p>
          <span className="text-[11px] text-primary">{o.serviceCategoryName}</span>
        </div>
      ),
    },
    {
      key: "totalAmount",
      header: "Amount",
      sortable: true,
      align: "right",
      render: (o) => (
        <span className="font-mono text-xs font-bold text-dark dark:text-white">
          ₦{o.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Fulfillment Status",
      sortable: true,
      render: (o) => {
        const colors: Record<string, string> = {
          COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
          CANCELLED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
          REFUNDED: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${colors[o.status] || colors.PENDING}`}>
            {o.status}
          </span>
        );
      },
    },
    {
      key: "paymentStatus",
      header: "Payment",
      sortable: true,
      render: (o) => {
        const isPaid = o.paymentStatus === "PAID";
        return (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
            isPaid
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
          }`}>
            {o.paymentStatus}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (o) => (
        <span className="text-xs text-body-color">
          {new Date(o.createdAt).toLocaleDateString("en-NG", { dateStyle: "short" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedOrder(o)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-dark dark:hover:text-white transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedOrder(o);
              setNewStatus(o.status);
              setShowStatusModal(true);
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition shadow-sm"
          >
            Status
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
        { label: "Pending", value: "PENDING" },
        { label: "Processing", value: "PROCESSING" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Cancelled", value: "CANCELLED" },
        { label: "Refunded", value: "REFUNDED" },
      ],
    },
    {
      key: "paymentStatus",
      label: "Payment",
      options: [
        { label: "Paid", value: "PAID" },
        { label: "Unpaid", value: "UNPAID" },
        { label: "Refunded", value: "REFUNDED" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="Orders & Service Fulfillment"
      breadcrumbs={[{ label: "Orders & Fulfillment" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Orders</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{orders.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Completed</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {orders.filter((o) => o.status === "COMPLETED").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Processing / In-Progress</span>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {orders.filter((o) => o.status === "PROCESSING" || o.status === "PENDING").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Gross Order Value</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">
              ₦{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <AdminDataTable
          columns={columns}
          data={orders}
          loading={loading}
          error={error}
          onRetry={loadOrders}
          searchPlaceholder="Search order number, service title, or customer name..."
          searchKeys={["orderNumber", "serviceTitle", "userName", "userEmail"]}
          filters={filters}
          emptyTitle="No orders found"
          emptyDescription="There are currently no orders matching your selected filters."
        />

        {/* Order Details Modal */}
        {selectedOrder && !showStatusModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div>
                  <span className="text-xs uppercase font-bold text-primary">Order Details</span>
                  <h3 className="text-base font-bold text-dark dark:text-white">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-gray-dark rounded-xl space-y-1">
                  <span className="font-bold text-dark dark:text-white block">Customer Info</span>
                  <p className="text-body-color">Name: {selectedOrder.userName}</p>
                  <p className="text-body-color">Email: {selectedOrder.userEmail}</p>
                  {selectedOrder.userPhone && <p className="text-body-color">Phone: {selectedOrder.userPhone}</p>}
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-dark rounded-xl space-y-1">
                  <span className="font-bold text-dark dark:text-white block">Service</span>
                  <p className="text-dark dark:text-white font-medium">{selectedOrder.serviceTitle}</p>
                  <p className="text-body-color">Category: {selectedOrder.serviceCategoryName}</p>
                  <p className="text-body-color font-mono">Amount: ₦{selectedOrder.totalAmount.toLocaleString()}</p>
                  <p className="text-body-color">Payment Method: {selectedOrder.paymentMethod || "WALLET"}</p>
                </div>

                {selectedOrder.notes && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300">
                    <span className="font-bold block mb-0.5">Fulfillment Notes / Token:</span>
                    <p className="font-mono">{selectedOrder.notes}</p>
                  </div>
                )}

                <div>
                  <span className="font-bold text-dark dark:text-white block mb-2">Fulfillment Timeline</span>
                  <div className="space-y-2 border-l-2 border-primary/30 pl-3">
                    {(selectedOrder.statusTimeline || []).map((tl, i) => (
                      <div key={i} className="relative">
                        <span className="font-bold text-dark dark:text-white">{tl.status}</span>
                        <p className="text-body-color">{tl.note}</p>
                        <span className="text-[10px] text-body-color/70">
                          {new Date(tl.timestamp).toLocaleString("en-NG")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-dark text-dark dark:text-white hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Update Order Status</h3>
                  <p className="text-xs text-body-color">{selectedOrder.orderNumber}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Select New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Fulfillment Note (Visible to Customer)
                  </label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Document printed and ready for pickup at our Origanrigan office."
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Confirm Update
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
