"use client";

import React, { useState, useEffect } from "react";
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
  Trash2,
  X,
  Edit2,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { ServiceCategory, ServiceStatus } from "@/types/service";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCategory | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceCategory | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formFullDesc, setFormFullDesc] = useState("");
  const [formStatus, setFormStatus] = useState<ServiceStatus>("available");
  const [formChannel, setFormChannel] = useState("Online & Walk-in");
  const [formTurnaround, setFormTurnaround] = useState("10–30 Minutes");
  const [formAudience, setFormAudience] = useState("Public, Agents, Corporates");
  const [formStartingPrice, setFormStartingPrice] = useState("₦1,000");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formFeaturesText, setFormFeaturesText] = useState("");
  const [formDeliverablesText, setFormDeliverablesText] = useState("");

  const loadServices = () => {
    try {
      setLoading(true);
      const list = platformApi.getServices();
      setServices([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreateModal = () => {
    setFormTitle("");
    setFormSlug("");
    setFormShortDesc("");
    setFormFullDesc("");
    setFormStatus("available");
    setFormChannel("Online & Walk-in");
    setFormTurnaround("10–30 Minutes");
    setFormAudience("General Public, Agents");
    setFormStartingPrice("₦1,000");
    setFormFeatured(false);
    setFormFeaturesText("Instant processing\nAutomated delivery\nSMS / Email confirmation");
    setFormDeliverablesText("Digital certificate / slip\nOfficial confirmation receipt");
    setShowCreateModal(true);
  };

  const openEditModal = (s: ServiceCategory) => {
    setEditingService(s);
    setFormTitle(s.title);
    setFormSlug(s.slug);
    setFormShortDesc(s.shortDescription);
    setFormFullDesc(s.fullDescription);
    setFormStatus(s.status);
    setFormChannel(s.onlineAvailability);
    setFormTurnaround(s.estimatedProcessingTime);
    setFormAudience(s.targetAudience);
    setFormStartingPrice(s.startingPrice || "₦1,000");
    setFormFeatured(!!s.featured);
    setFormFeaturesText((s.features || []).join("\n"));
    setFormDeliverablesText((s.deliverables || []).join("\n"));
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const slug = formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const features = formFeaturesText.split("\n").map((f) => f.trim()).filter(Boolean);
    const deliverables = formDeliverablesText.split("\n").map((d) => d.trim()).filter(Boolean);

    try {
      platformApi.createService({
        title: formTitle.trim(),
        slug,
        shortDescription: formShortDesc.trim() || formTitle.trim(),
        fullDescription: formFullDesc.trim() || formShortDesc.trim() || formTitle.trim(),
        status: formStatus,
        onlineAvailability: formChannel,
        estimatedProcessingTime: formTurnaround,
        targetAudience: formAudience,
        startingPrice: formStartingPrice,
        featured: formFeatured,
        icon: "Shield",
        features: features.length > 0 ? features : ["Fast processing", "Full compliance"],
        deliverables: deliverables.length > 0 ? deliverables : ["Official confirmation slip"],
        subServices: [],
      });
      setShowCreateModal(false);
      setActionFeedback("Service created successfully");
      setTimeout(() => setActionFeedback(null), 3500);
      loadServices();
    } catch (err: any) {
      alert(err.message || "Failed to create service");
    }
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const features = formFeaturesText.split("\n").map((f) => f.trim()).filter(Boolean);
    const deliverables = formDeliverablesText.split("\n").map((d) => d.trim()).filter(Boolean);

    try {
      platformApi.updateService(editingService.id, {
        title: formTitle.trim(),
        slug: formSlug.trim(),
        shortDescription: formShortDesc.trim(),
        fullDescription: formFullDesc.trim(),
        status: formStatus,
        onlineAvailability: formChannel,
        estimatedProcessingTime: formTurnaround,
        targetAudience: formAudience,
        startingPrice: formStartingPrice,
        featured: formFeatured,
        features,
        deliverables,
      });
      setEditingService(null);
      setActionFeedback("Service details updated successfully");
      setTimeout(() => setActionFeedback(null), 3500);
      loadServices();
    } catch (err: any) {
      alert(err.message || "Failed to update service");
    }
  };

  const handleDeleteService = () => {
    if (!deletingService) return;
    try {
      platformApi.deleteService(deletingService.id);
      setDeletingService(null);
      setActionFeedback(`Service ${deletingService.title} has been deleted`);
      setTimeout(() => setActionFeedback(null), 3500);
      loadServices();
    } catch (err: any) {
      alert(err.message || "Failed to delete service");
    }
  };

  const handleToggleStatus = (srv: ServiceCategory) => {
    const nextStatus: ServiceStatus = srv.status === "available" ? "request_only" : "available";
    platformApi.updateService(srv.id, { status: nextStatus });
    loadServices();
  };

  const handleToggleFeatured = (srv: ServiceCategory) => {
    platformApi.updateService(srv.id, { featured: !srv.featured });
    loadServices();
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
            onClick={() => openEditModal(s)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
            title="Edit Service"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(s)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-dark dark:text-white hover:bg-gray-200 transition"
          >
            {s.status === "available" ? "Pause" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => setDeletingService(s)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            title="Delete Service"
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
        {/* Top bar with Add Service CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white">Service Offerings & Pricing Catalog</h2>
            <p className="text-xs text-body-color">Manage customer-facing digital services, turnarounds, and availability.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>

        {/* Action feedback message */}
        {actionFeedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionFeedback}</span>
          </div>
        )}

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
          loading={loading}
          error={error}
          onRetry={loadServices}
          searchPlaceholder="Search service title, description, or slug..."
          searchKeys={["title", "shortDescription", "slug"]}
          filters={filters}
          emptyTitle="No services found"
          emptyDescription="Try clearing your search query."
        />

        {/* Create Service Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Add Catalog Service</h3>
                    <p className="text-xs text-body-color">Introduce a new service offering</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateService} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Service Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CAC Business Name Registration"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">URL Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. cac-registration"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Short Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief 1-sentence summary"
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    placeholder="Comprehensive overview of requirements, process and guarantee"
                    value={formFullDesc}
                    onChange={(e) => setFormFullDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as ServiceStatus)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="available">Available (Instant / Live)</option>
                      <option value="request_only">Request Only</option>
                      <option value="coming_soon">Coming Soon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Turnaround Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 24–48 Hours"
                      value={formTurnaround}
                      onChange={(e) => setFormTurnaround(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Starting Price</label>
                    <input
                      type="text"
                      placeholder="e.g. ₦15,000"
                      value={formStartingPrice}
                      onChange={(e) => setFormStartingPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Key Features (One per line)</label>
                    <textarea
                      rows={3}
                      value={formFeaturesText}
                      onChange={(e) => setFormFeaturesText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Deliverables (One per line)</label>
                    <textarea
                      rows={3}
                      value={formDeliverablesText}
                      onChange={(e) => setFormDeliverablesText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="createFeatured"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="createFeatured" className="text-xs text-dark dark:text-white font-medium cursor-pointer">
                    Feature on homepage banner and quick actions
                  </label>
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
                    Save Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {editingService && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit Service</h3>
                    <p className="text-xs text-body-color">{editingService.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingService(null)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateService} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Service Title *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">URL Slug</label>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Short Description</label>
                  <input
                    type="text"
                    required
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={formFullDesc}
                    onChange={(e) => setFormFullDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as ServiceStatus)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="available">Available</option>
                      <option value="request_only">Request Only</option>
                      <option value="coming_soon">Coming Soon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Turnaround Time</label>
                    <input
                      type="text"
                      value={formTurnaround}
                      onChange={(e) => setFormTurnaround(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Starting Price</label>
                    <input
                      type="text"
                      value={formStartingPrice}
                      onChange={(e) => setFormStartingPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Features (One per line)</label>
                    <textarea
                      rows={3}
                      value={formFeaturesText}
                      onChange={(e) => setFormFeaturesText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Deliverables (One per line)</label>
                    <textarea
                      rows={3}
                      value={formDeliverablesText}
                      onChange={(e) => setFormDeliverablesText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editFeatured"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="editFeatured" className="text-xs text-dark dark:text-white font-medium cursor-pointer">
                    Featured on Landing Page
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                  >
                    Update Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Service Modal */}
        {deletingService && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Service</h3>
                  <p className="text-xs text-body-color">Removal from public catalog</p>
                </div>
              </div>

              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete <strong className="text-dark dark:text-white">{deletingService.title}</strong>? Customers will no longer be able to view or request this service online.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingService(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteService}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

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
                <div className="flex justify-between text-body-color">
                  <span>Starting Retail Price:</span>
                  <span className="font-semibold text-emerald-600">{selectedService.startingPrice || "Standard"}</span>
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const s = selectedService;
                      setSelectedService(null);
                      openEditModal(s);
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-dark dark:text-white transition"
                  >
                    Edit
                  </button>
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

