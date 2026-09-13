"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Smartphone,
  Printer,
  Palette,
  Code,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  Edit2,
  Plus,
  ArrowUpDown,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { ServiceCategoryRecord } from "@/types/platform";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<ServiceCategoryRecord | null>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategoryRecord | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ServiceCategoryRecord | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formActiveOfferings, setFormActiveOfferings] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [formSortOrder, setFormSortOrder] = useState<number>(1);

  const loadCategories = () => {
    try {
      setLoading(true);
      const list = platformApi.getCategories();
      setCategories([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormActiveOfferings(1);
    setFormStatus("ACTIVE");
    setFormSortOrder(categories.length + 1);
    setShowCreateModal(true);
  };

  const openEditModal = (c: ServiceCategoryRecord) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormCode(c.code);
    setFormDescription(c.description);
    setFormActiveOfferings(c.activeOfferings);
    setFormStatus(c.status);
    setFormSortOrder(c.sortOrder);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    try {
      platformApi.createCategory({
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim(),
        activeOfferings: Number(formActiveOfferings) || 0,
        status: formStatus,
        sortOrder: Number(formSortOrder) || 1,
      });
      setShowCreateModal(false);
      setActionFeedback("Category added successfully");
      setTimeout(() => setActionFeedback(null), 3500);
      loadCategories();
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    }
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      platformApi.updateCategory(editingCategory.id, {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim(),
        activeOfferings: Number(formActiveOfferings) || 0,
        status: formStatus,
        sortOrder: Number(formSortOrder) || 1,
      });
      setEditingCategory(null);
      setActionFeedback("Category updated successfully");
      setTimeout(() => setActionFeedback(null), 3500);
      loadCategories();
    } catch (err: any) {
      alert(err.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = () => {
    if (!deletingCategory) return;
    try {
      platformApi.deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
      setActionFeedback(`Category ${deletingCategory.name} deleted`);
      setTimeout(() => setActionFeedback(null), 3500);
      loadCategories();
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  const handleToggleStatus = (catId: string) => {
    const item = categories.find((c) => c.id === catId);
    if (!item) return;
    const next = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    platformApi.updateCategory(catId, { status: next });
    loadCategories();
  };

  const columns: Column<ServiceCategoryRecord>[] = [
    {
      key: "name",
      header: "Category",
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-bold text-dark dark:text-white text-xs block">{c.name}</span>
          <span className="text-[11px] text-body-color">{c.description}</span>
        </div>
      ),
    },
    {
      key: "code",
      header: "System Code",
      render: (c) => <span className="font-mono text-xs text-primary font-bold">{c.code}</span>,
    },
    {
      key: "activeOfferings",
      header: "Active Services",
      sortable: true,
      align: "center",
      render: (c) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-dark dark:text-white">
          {c.activeOfferings} services
        </span>
      ),
    },
    {
      key: "sortOrder",
      header: "Display Order",
      sortable: true,
      align: "center",
      render: (c) => <span className="font-mono text-xs text-body-color">#{c.sortOrder}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (c) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
          c.status === "ACTIVE"
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.status === "ACTIVE" ? "bg-emerald-500" : "bg-gray-400"}`} />
          <span>{c.status}</span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="View Details"
            onClick={() => setViewingCategory(c)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-dark transition"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Edit Category"
            onClick={() => openEditModal(c)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(c.id)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-dark dark:text-white hover:bg-gray-200 transition"
          >
            {c.status === "ACTIVE" ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            title="Delete Category"
            onClick={() => setDeletingCategory(c)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      pageTitle="Service Category Classifications"
      breadcrumbs={[{ label: "Service Categories" }]}
    >
      <div className="space-y-6">
        {/* Top bar with Add Category CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white">Classification Groups</h2>
            <p className="text-xs text-body-color">Manage business domain categories, sorting order, and active listings.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Categories</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{categories.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Active Classifications</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {categories.filter((c) => c.status === "ACTIVE").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Cumulative Offerings</span>
            <p className="text-xl font-bold text-primary mt-1">
              {categories.reduce((s, c) => s + c.activeOfferings, 0)} Total
            </p>
          </div>
        </div>

        {/* Categories Table */}
        <AdminDataTable
          columns={columns}
          data={categories}
          loading={loading}
          error={error}
          onRetry={loadCategories}
          searchPlaceholder="Search category by name or code..."
          searchKeys={["name", "code", "description"]}
          emptyTitle="No categories found"
          emptyDescription="There are no categories matching your search query."
        />

        {/* Create Category Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Create Service Category</h3>
                    <p className="text-xs text-body-color">Add a new operational department or catalog group</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Identity & Biometrics"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">System Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BIOMETRICS"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the services in this category"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Initial Active Offerings</label>
                    <input
                      type="number"
                      min={0}
                      value={formActiveOfferings}
                      onChange={(e) => setFormActiveOfferings(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Initial Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
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
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Category Modal */}
        {viewingCategory && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">{viewingCategory.name}</h3>
                    <span className="text-xs font-mono text-primary font-bold">{viewingCategory.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingCategory(null)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-dark rounded-xl space-y-2 text-xs">
                <div>
                  <span className="text-body-color block mb-1">Description:</span>
                  <p className="text-dark dark:text-white leading-relaxed">{viewingCategory.description}</p>
                </div>
                <div className="flex justify-between pt-2 border-t border-stroke/40 dark:border-strokedark/40">
                  <span className="text-body-color">Active Services Count:</span>
                  <span className="font-bold text-dark dark:text-white">{viewingCategory.activeOfferings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-color">Sort Order:</span>
                  <span className="font-bold text-dark dark:text-white">#{viewingCategory.sortOrder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-color">Status:</span>
                  <span className={`font-bold ${viewingCategory.status === "ACTIVE" ? "text-emerald-600" : "text-gray-400"}`}>
                    {viewingCategory.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = viewingCategory;
                    setViewingCategory(null);
                    openEditModal(c);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
                >
                  Edit Category
                </button>
                <button
                  type="button"
                  onClick={() => setViewingCategory(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit Category</h3>
                    <p className="text-xs text-body-color">{editingCategory.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">System Code *</label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Active Offerings Count</label>
                    <input
                      type="number"
                      min={0}
                      value={formActiveOfferings}
                      onChange={(e) => setFormActiveOfferings(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
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

        {/* Delete Category Modal */}
        {deletingCategory && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete Category</h3>
                  <p className="text-xs text-body-color">Removal of classification group</p>
                </div>
              </div>

              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete <strong className="text-dark dark:text-white">{deletingCategory.name}</strong> ({deletingCategory.code})?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCategory}
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

