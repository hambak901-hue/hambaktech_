"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Grid,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  ExternalLink,
  Plus,
  Sparkles,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import { servicesData } from "@/data/servicesData";
import { ServiceCategory, ServiceStatus } from "@/types/service";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceCategory[]>(servicesData);
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleToggleStatus = (srv: ServiceCategory) => {
    const nextStatus: ServiceStatus = srv.status === "available" ? "request_only" : "available";
    setServices(services.map((s) => (s.id === srv.id ? { ...s, status: nextStatus } : s)));
  };

  const handleToggleFeatured = (srv: ServiceCategory) => {
    setServices(services.map((s) => (s.id === srv.id ? { ...s, featured: !s.featured } : s)));
  };

  const columns: Column<ServiceCategory>[] = [
    {
      key: "title",
      header: "Service Offering",
      sortable: true,
      render: (s) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-dark dark:text-white text-xs">{s.title}</span>
            {s.featured && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                Featured
              </span>
            )}
          </div>
          <p className="text-[11px] text-body-color truncate max-w-sm">{s.shortDescription}</p>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Category Slug",
      render: (s) => <span className="text-xs font-mono text-primary">/{s.slug}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (s) => {
        const colors: Record<string, string> = {
          available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
          request_only: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          coming_soon: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${colors[s.status] || colors.available}`}>
            {s.status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "onlineAvailability",
      header: "Channel",
      render: (s) => <span className="text-xs text-body-color">{s.onlineAvailability}</span>,
    },
    {
      key: "estimatedProcessingTime",
      header: "Est. Turnaround",
      render: (s) => (
        <span className="text-xs text-body-color truncate max-w-[160px] block" title={s.estimatedProcessingTime}>
          {s.estimatedProcessingTime}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleToggleFeatured(s)}
            className={`p-1.5 rounded-lg border border-stroke dark:border-strokedark transition ${
              s.featured ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40" : "text-body-color hover:text-dark"
            }`}
            title="Toggle Featured"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedService(s)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-dark transition"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(s)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-dark dark:text-white hover:bg-gray-200 transition"
          >
            {s.status === "available" ? "Pause" : "Activate"}
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
        { label: "Available", value: "available" },
        { label: "Request Only", value: "request_only" },
        { label: "Coming Soon", value: "coming_soon" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="Services Catalog Management"
      breadcrumbs={[{ label: "Services Catalog" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Catalog Items</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{services.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Active & Available</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {services.filter((s) => s.status === "available").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Request-Only</span>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {services.filter((s) => s.status === "request_only").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Featured On Landing</span>
            <p className="text-xl font-bold text-amber-600 mt-1">
              {services.filter((s) => s.featured).length}
            </p>
          </div>
        </div>

        {/* Services Table */}
        <AdminDataTable
          columns={columns}
          data={services}
          searchPlaceholder="Search service title, description, or slug..."
          searchKeys={["title", "shortDescription", "slug"]}
          filters={filters}
          emptyTitle="No services found"
          emptyDescription="Try clearing your search query."
        />

        {/* Service Details Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
                <div>
                  <span className="text-xs uppercase font-bold text-primary">Catalog Item</span>
                  <h3 className="text-base font-bold text-dark dark:text-white">
                    {selectedService.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="p-1 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-body-color leading-relaxed">{selectedService.fullDescription}</p>

                <div className="p-3 bg-gray-50 dark:bg-gray-dark rounded-xl space-y-1">
                  <span className="font-bold text-dark dark:text-white block">Key Features</span>
                  <ul className="list-disc pl-4 space-y-1 text-body-color">
                    {selectedService.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-dark rounded-xl space-y-1">
                  <span className="font-bold text-dark dark:text-white block">Deliverables & Output</span>
                  <ul className="list-disc pl-4 space-y-1 text-body-color">
                    {selectedService.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between text-body-color pt-1">
                  <span>Target Audience:</span>
                  <span className="font-semibold text-dark dark:text-white">{selectedService.targetAudience}</span>
                </div>
                <div className="flex justify-between text-body-color">
                  <span>Estimated Processing Time:</span>
                  <span className="font-semibold text-dark dark:text-white">{selectedService.estimatedProcessingTime}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Link
                  href={`/services/${selectedService.slug}`}
                  target="_blank"
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
