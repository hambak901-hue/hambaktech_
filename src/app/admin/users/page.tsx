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
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column, FilterOption } from "@/components/Admin/AdminDataTable";
import platformApi from "@/lib/api-client";
import { User, RoleSlug, UserStatus } from "@/types/platform";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<RoleSlug>("customer");

  const loadUsers = () => {
    try {
      setLoading(true);
      const list = platformApi.getUsers();
      setUsers(list);
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

  const handleToggleStatus = (user: User) => {
    const nextStatus: UserStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    platformApi.updateUserStatus(user.id, nextStatus);
    loadUsers();
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      platformApi.updateUserRole(selectedUser.id, newRole);
      setShowRoleModal(false);
      loadUsers();
    }
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
          <button
            type="button"
            onClick={() => {
              setSelectedUser(u);
              setNewRole(u.role);
              setShowRoleModal(true);
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark text-dark dark:text-white transition"
          >
            Role
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(u)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              u.status === "ACTIVE"
                ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
          </button>
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

        {/* Change Role Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full p-6 border border-stroke dark:border-strokedark shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark dark:text-white">Modify User Access Role</h3>
                  <p className="text-xs text-body-color">{selectedUser.fullName}</p>
                </div>
              </div>

              <form onSubmit={handleSaveRole} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark dark:text-white mb-1.5">
                    Assign Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as RoleSlug)}
                    className="w-full px-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                  >
                    <option value="customer">Customer (Standard Retail Access)</option>
                    <option value="agent">Agent (Discounted VTU Reseller Tier)</option>
                    <option value="staff">Staff (Front-Desk Operations Access)</option>
                    <option value="instructor">Instructor (Academy Course Instructor)</option>
                    <option value="admin">Administrator (Full Back-Office Access)</option>
                  </select>
                </div>

                <p className="text-xs text-body-color">
                  Changing roles adjusts the user&apos;s permissions, pricing tier, and portal access level.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
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
      </div>
    </AdminLayout>
  );
}
