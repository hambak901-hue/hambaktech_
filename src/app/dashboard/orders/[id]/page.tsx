"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  Download,
  Share2,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import { Order } from "@/types/platform";
import companyConfig from "@/data/companyConfig";

export default function OrderDetailsReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (orderId) {
      async function fetchOrder() {
        setLoading(true);
        try {
          const res = await fetch(`/api/v1/orders/${encodeURIComponent(orderId)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.order && isMounted) {
              setOrder(data.data.order);
              return;
            }
          }
        } catch (err) {
          console.warn("[OrderDetail] Falling back to client store cache:", err);
        } finally {
          if (isMounted) setLoading(false);
        }

        if (isMounted) {
          const found = platformApi.getOrderById(orderId);
          setOrder(found || null);
        }
      }

      fetchOrder();
    }
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (!order) {
    return (
      <DashboardLayout pageTitle="Order Not Found">
        <div className="py-16 text-center">
          <h3 className="text-base font-bold text-dark dark:text-white">Order Record Not Found</h3>
          <p className="text-xs text-body-color mt-1">
            The requested order identifier ({orderId}) does not exist in your account.
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-4 inline-block px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold"
          >
            Back to Orders
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout
      pageTitle={`Order Receipt: ${order.orderNumber}`}
      breadcrumbs={[
        { label: "Orders", href: "/dashboard/orders" },
        { label: order.orderNumber },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-body-color hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
        </div>

        {/* Official Printable Receipt Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="border-b border-stroke dark:border-strokedark pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold text-primary tracking-wider uppercase block">
                  Official Service Receipt
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-dark dark:text-white mt-0.5">
                  {companyConfig.legalName}
                </h2>
                <p className="text-xs text-body-color mt-1">
                  Brand: <strong className="text-dark dark:text-white">{companyConfig.name}</strong> • &quot;{companyConfig.slogan}&quot;
                </p>
                <div className="text-[11px] text-body-color mt-2 space-y-0.5">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>{companyConfig.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-primary" />
                    <span>{companyConfig.phonePrimary} / WhatsApp: {companyConfig.whatsapp}</span>
                  </p>
                </div>
              </div>

              {/* Order Meta Box */}
              <div className="sm:text-right bg-gray-50 dark:bg-gray-dark p-3.5 rounded-2xl border border-stroke dark:border-strokedark sm:min-w-[200px]">
                <span className="text-[10px] uppercase font-bold text-body-color block">Order Number</span>
                <span className="text-sm font-bold text-primary dark:text-primary block mt-0.5">
                  {order.orderNumber}
                </span>
                <span className="text-[10px] text-body-color block mt-1">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <div className="mt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 mb-6 border-b border-stroke dark:border-strokedark text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-body-color block mb-1">
                Billed Customer:
              </span>
              <p className="font-bold text-dark dark:text-white text-sm">Adebayo Oluwaseun</p>
              <p className="text-body-color">adebayo@example.com</p>
              <p className="text-body-color">Tel: 08140001234</p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase text-body-color block mb-1">
                Payment & Fulfillment:
              </span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                Payment Status: {order.paymentStatus}
              </p>
              <p className="text-body-color">Method: {order.paymentMethod}</p>
              <p className="text-body-color">Delivery: {order.deliveryType.replace(/_/g, " ")}</p>
            </div>
          </div>

          {/* Itemized Service Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase text-body-color mb-3">Itemized Details</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark text-body-color">
                    <th className="pb-2 font-semibold">Service Description</th>
                    <th className="pb-2 font-semibold text-center">Category</th>
                    <th className="pb-2 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  <tr>
                    <td className="py-3">
                      <p className="font-bold text-dark dark:text-white">{order.serviceTitle}</p>
                      {order.items && order.items[0]?.serviceId && (
                        <span className="text-[10px] text-body-color">Code: {order.items[0].serviceId}</span>
                      )}
                    </td>
                    <td className="py-3 text-center text-body-color">{order.serviceCategoryName}</td>
                    <td className="py-3 font-bold text-right text-dark dark:text-white">
                      ₦{order.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-stroke dark:border-strokedark">
                    <td colSpan={2} className="pt-3 font-bold text-right text-dark dark:text-white">
                      Total Paid:
                    </td>
                    <td className="pt-3 font-extrabold text-base text-right text-primary">
                      ₦{order.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Service Timeline / Audit Trail */}
          <div className="pt-4 border-t border-stroke dark:border-strokedark">
            <h4 className="text-xs font-bold uppercase text-body-color mb-3">
              Fulfillment Audit & Progress Timeline
            </h4>
            <div className="space-y-3">
              {(order.timeline || order.statusTimeline || []).map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-dark dark:text-white">{step.status}</span>
                      <span className="text-[10px] text-body-color">
                        {new Date(step.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-body-color mt-0.5">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt Stamp / Footer */}
          <div className="mt-8 pt-6 border-t border-stroke dark:border-strokedark flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-body-color">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Verified HambakTech Electronic Service Record</span>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-semibold text-dark dark:text-white">Hambaktech & Services</p>
              <p>Origanrigan Cele Area, Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
