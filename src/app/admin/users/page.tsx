"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Phone,
  Mail,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  X,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { User, RoleSlug, UserStatus } from "@/types/platform";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<RoleSlug>("customer");
  const [formStatus, setFormStatus] = useState<UserStatus>("ACTIVE");
  const [formState, setFormState] = useState("Lagos State");
  const [formLga, setFormLga] = useState("Ibeju-Lekki");
  const [formAddress, setFormAddress] = useState("");

  const loadUsers = () => {
    try {
      setLoading(true);
      const list = platformApi.getUsers();
      setUsers([...list]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setFormFullName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("customer");
    setFormStatus("ACTIVE");
    setFormState("Lagos State");
    setFormLga("Ibeju-Lekki");
    setFormAddress("");
    setShowCreateModal(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormFullName(u.fullName);
    setFormEmail(u.email);
    setFormPhone(u.phone || "");
    setFormRole(u.role);
    setFormStatus(u.status);
    setFormState(u.state || "Lagos State");
    setFormLga(u.lga || "Ibeju-Lekki");
    setFormAddress(u.address || "");
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formEmail.trim()) return;

    try {
      platformApi.createUser({
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        status: formStatus,
        state: formState,
        lga: formLga,
        address: formAddress.trim() || undefined,
      });
      setShowCreateModal(false);
      setActionFeedback("User created successfully");
      setTimeout(() => setActionFeedback(null), 3500);
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to create user");
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      platformApi.updateUser(editingUser.id, {
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        status: formStatus,
        state: formState,
        lga: formLga,
        address: formAddress.trim() || undefined,
      });
      setEditingUser(null);
      setActionFeedback("User details updated successfully");
      setTimeout(() => setActionFeedback(null), 3500);
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update user");
    }
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    try {
      platformApi.deleteUser(deletingUser.id);
      setDeletingUser(null);
      setActionFeedback(`User ${deletingUser.fullName} has been removed`);
      setTimeout(() => setActionFeedback(null), 3500);
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus: UserStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    platformApi.updateUserStatus(user.id, nextStatus);
    loadUsers();
  };

  const columns: Column<User>[] = [
    {
      key: "fullName",
      header: "User Details",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {u.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-dark dark:text-white truncate">{u.fullName}</p>
            <p className="text-[11px] text-body-color truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (u) => {
        const roleColors: Record<string, string> = {
          admin: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
          agent: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
          staff: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
          instructor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
          customer: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${roleColors[u.role] || roleColors.customer}`}>
            {u.role}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (u) => {
        const isAct = u.status === "ACTIVE";
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
            isAct
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAct ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span>{u.status}</span>
          </span>
        );
      },
    },
    {
      key: "phone",
      header: "Phone / Contact",
      render: (u) => <span className="font-mono text-xs">{u.phone || "—"}</span>,
    },
    {
      key: "lga",
      header: "Location",
      render: (u) => <span className="text-xs">{u.lga ? `${u.lga}, ${u.state || "Lagos"}` : "Lagos, Nigeria"}</span>,
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      render: (u) => (
        <span className="text-xs text-body-color">
          {new Date(u.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* View Details */}
          <button
            type="button"
            title="View Profile Details"
            onClick={() => setViewingUser(u)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-primary transition"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {/* Edit User */}
          <button
            type="button"
            title="Edit User"
            onClick={() => openEditModal(u)}
            className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color hover:text-amber-600 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {/* Toggle Status */}
          <button
            type="button"
            onClick={() => handleToggleStatus(u)}
            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition ${
              u.status === "ACTIVE"
                ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40"
                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40"
            }`}
          >
            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
          </button>
          {/* Delete User */}
          {u.email !== "admin@hambaktech.com.ng" && (
            <button
              type="button"
              title="Delete User"
              onClick={() => setDeletingUser(u)}
              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "role",
      label: "Role",
      options: [
        { label: "Customer", value: "customer" },
        { label: "Agent / Reseller", value: "agent" },
        { label: "Staff", value: "staff" },
        { label: "Admin", value: "admin" },
        { label: "Instructor", value: "instructor" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Suspended", value: "SUSPENDED" },
        { label: "Pending Verification", value: "PENDING_VERIFICATION" },
      ],
    },
  ];

  return (
    <AdminLayout
      pageTitle="User & Account Management"
      breadcrumbs={[{ label: "Users & Accounts" }]}
    >
      <div className="space-y-6">
        {/* Top bar with Add User CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white">Directory & Access Roles</h2>
            <p className="text-xs text-body-color">Manage customer accounts, reseller agents, instructors, and staff.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
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
            <span className="text-xs text-body-color font-semibold block">Total Registered</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{users.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Active Users</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {users.filter((u) => u.status === "ACTIVE").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Agents & Resellers</span>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {users.filter((u) => u.role === "agent").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Suspended</span>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {users.filter((u) => u.status === "SUSPENDED").length}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <AdminDataTable
          columns={columns}
          data={users}
          loading={loading}
          error={error}
          onRetry={loadUsers}
          searchPlaceholder="Search by user name, email, or phone number..."
          searchKeys={["fullName", "email", "phone"]}
          filters={filters}
          emptyTitle="No users found"
          emptyDescription="Try adjusting your filter options or search keyword."
        />

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Create New User</h3>
                    <p className="text-xs text-body-color">Add an account to the platform</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Adeleke"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="samuel@gmail.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="08012345678"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Platform Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as RoleSlug)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="customer">Customer (Standard Retail)</option>
                      <option value="agent">Agent (Discounted Reseller)</option>
                      <option value="staff">Staff (Front-Desk / Operations)</option>
                      <option value="instructor">Instructor (Academy Teacher)</option>
                      <option value="admin">Administrator (Full Back-Office)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Initial Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">LGA (Lagos / Nigeria)</label>
                    <input
                      type="text"
                      placeholder="Ibeju-Lekki"
                      value={formLga}
                      onChange={(e) => setFormLga(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Physical Address / Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Eleko Beach Road, Ibeju-Lekki"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
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
                    Save & Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {viewingUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center">
                    {viewingUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">{viewingUser.fullName}</h3>
                    <span className="text-xs text-body-color">{viewingUser.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingUser(null)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-dark rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-body-color">System User ID:</span>
                  <span className="font-mono font-bold text-dark dark:text-white">{viewingUser.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-color">Role / Permission:</span>
                  <span className="font-bold uppercase text-primary">{viewingUser.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-color">Account Status:</span>
                  <span className={`font-bold ${viewingUser.status === "ACTIVE" ? "text-emerald-600" : "text-rose-600"}`}>
                    {viewingUser.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-color">Contact Phone:</span>
                  <span className="font-mono text-dark dark:text-white">{viewingUser.phone || "None registered"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-color">State / LGA:</span>
                  <span className="text-dark dark:text-white">{viewingUser.lga || "Ibeju-Lekki"}, {viewingUser.state || "Lagos"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-color">Registered Date:</span>
                  <span className="text-dark dark:text-white">{new Date(viewingUser.createdAt).toLocaleDateString("en-NG", { dateStyle: "long" })}</span>
                </div>
                {viewingUser.address && (
                  <div className="pt-1 border-t border-stroke/40 dark:border-strokedark/40">
                    <span className="text-body-color block mb-0.5">Physical Address:</span>
                    <span className="text-dark dark:text-white">{viewingUser.address}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const u = viewingUser;
                    setViewingUser(null);
                    openEditModal(u);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition"
                >
                  Edit User Details
                </button>
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark dark:text-white">Edit User Record</h3>
                    <p className="text-xs text-body-color">{editingUser.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Platform Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as RoleSlug)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="customer">Customer</option>
                      <option value="agent">Agent (Reseller Tier)</option>
                      <option value="staff">Staff</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">Account Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark dark:text-white mb-1">LGA</label>
                    <input
                      type="text"
                      value={formLga}
                      onChange={(e) => setFormLga(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
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

        {/* Delete User Confirmation Modal */}
        {deletingUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Delete User Account</h3>
                  <p className="text-xs text-body-color">Permanent action</p>
                </div>
              </div>

              <p className="text-xs text-body-color leading-relaxed">
                Are you sure you want to delete <strong className="text-dark dark:text-white">{deletingUser.fullName}</strong> ({deletingUser.email})? All associated session records and permissions will be removed from the system.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
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

