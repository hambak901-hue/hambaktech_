"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

interface NavItem {
  id: string;
  label: string;
  path: string;
  enabled: boolean;
  order: number;
}

export default function AdminNavigationPage() {
  const [publicNav, setPublicNav] = useState<NavItem[]>([
    { id: "nav-home", label: "Home", path: "/", enabled: true, order: 1 },
    { id: "nav-services", label: "Services", path: "/services", enabled: true, order: 2 },
    { id: "nav-academy", label: "Academy", path: "/academy", enabled: true, order: 3 },
    { id: "nav-shop", label: "Shop", path: "/shop", enabled: true, order: 4 },
    { id: "nav-blog", label: "News / Blog", path: "/blog", enabled: true, order: 5 },
    { id: "nav-contact", label: "Contact Us", path: "/contact", enabled: true, order: 6 },
    { id: "nav-about", label: "About Us", path: "/about", enabled: true, order: 7 },
  ]);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New item draft
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState("");
  const [leakWarning, setLeakWarning] = useState<string | null>(null);

  useEffect(() => {
    fetch(getApiUrl("/api/admin/navigation"), {
      headers: getAuthHeaders(),
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.public_nav) {
          setPublicNav(json.data.public_nav);
        }
      })
      .catch(() => {});
  }, []);

  const forbiddenPrefixes = ["/admin", "/dashboard", "/portal", "/ops", "/api"];

  const validatePath = (path: string): boolean => {
    const p = path.toLowerCase().trim();
    for (const forb of forbiddenPrefixes) {
      if (p.startsWith(forb)) {
        return false;
      }
    }
    return true;
  };

  const handleAddNavItem = () => {
    if (!newLabel.trim() || !newPath.trim()) return;

    if (!validatePath(newPath)) {
      setLeakWarning(
        `Security Guard Active: You cannot expose '${newPath}' in the public navigation. Protected dashboard/admin routes must remain behind authentication.`
      );
      return;
    }

    setLeakWarning(null);
    const item: NavItem = {
      id: `nav-${Date.now()}`,
      label: newLabel.trim(),
      path: newPath.trim(),
      enabled: true,
      order: publicNav.length + 1,
    };

    setPublicNav([...publicNav, item]);
    setNewLabel("");
    setNewPath("");
  };

  const handleRemoveItem = (id: string) => {
    setPublicNav(publicNav.filter((item) => item.id !== id));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...publicNav];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    newItems.forEach((it, idx) => {
      it.order = idx + 1;
    });

    setPublicNav(newItems);
  };

  const toggleItem = (index: number) => {
    const newItems = [...publicNav];
    newItems[index].enabled = !newItems[index].enabled;
    setPublicNav(newItems);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce invariant before sending
    for (const item of publicNav) {
      if (!validatePath(item.path)) {
        setFeedback({
          type: "error",
          message: `Security Boundary Violation: '${item.path}' is an internal route. Cannot save to public navigation.`,
        });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/admin/navigation"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          public_nav: publicNav,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", message: "Public navigation menu updated successfully." });
      } else {
        setFeedback({ type: "error", message: json.message || "Failed to update navigation settings." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error occurred while saving navigation." });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <AdminLayout
      pageTitle="Super Admin Navigation & Route Boundary Control"
      breadcrumbs={[{ label: "Super Admin" }, { label: "Navigation Control" }]}
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-6xl">
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Security Rule Notice */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Strict Navigation Isolation Policy:</span>
            <p className="leading-relaxed">
              Super Admin can customize public site links, but the platform enforces a physical security boundary preventing protected dashboards (e.g. <code>/admin</code>, <code>/dashboard</code>, <code>/portal</code>) from being exposed in public menus.
            </p>
          </div>
        </div>

        {/* Section 1: Public Navigation Items */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Menu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Public Header Navigation Items</h3>
                <p className="text-xs text-body-color">Links displayed in the top navbar for all unauthenticated and guest visitors</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {publicNav.map((item, idx) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  item.enabled
                    ? "bg-white dark:bg-dark border-stroke dark:border-strokedark"
                    : "bg-gray-50 dark:bg-gray-dark/50 border-stroke/60 dark:border-strokedark/60 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {item.order}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-dark dark:text-white">{item.label}</h4>
                    <span className="text-[11px] font-mono text-body-color">{item.path}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark disabled:opacity-30 transition"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, "down")}
                    disabled={idx === publicNav.length - 1}
                    className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-gray-100 dark:hover:bg-gray-dark disabled:opacity-30 transition"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleItem(idx)}
                    className="p-1 rounded-lg transition"
                  >
                    {item.enabled ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Link Card */}
          <div className="p-4 rounded-xl border border-dashed border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-dark/30 space-y-3">
            <span className="text-xs font-bold text-dark dark:text-white block">Add New Public Navigation Link</span>
            {leakWarning && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{leakWarning}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Link Label (e.g. FAQs)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="URL Path (e.g. /faq or https://external.org)"
                  value={newPath}
                  onChange={(e) => {
                    setNewPath(e.target.value);
                    if (leakWarning) setLeakWarning(null);
                  }}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddNavItem}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Route Isolation Status */}
        <div className="p-6 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stroke dark:border-strokedark">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark dark:text-white">Authoritative Route Separation Status</h3>
              <p className="text-xs text-body-color">Three strictly isolated tiers of navigation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-dark/50 space-y-2">
              <span className="text-xs font-bold text-emerald-600 block">Tier 1: Public Website</span>
              <p className="text-[11px] text-body-color">
                Open to all web traffic. Includes Homepage, Services catalog, ICT Academy syllabus, Stationery store, Blog, and Contact desks.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-dark/50 space-y-2">
              <span className="text-xs font-bold text-blue-600 block">Tier 2: Authenticated Portals</span>
              <p className="text-[11px] text-body-color">
                Protected by HttpOnly session cookie. Dedicated dashboards: <code>/dashboard</code> (Customer), <code>/dashboard/academy</code> (Student).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-dark/50 space-y-2">
              <span className="text-xs font-bold text-purple-600 block">Tier 3: Admin & Control Centre</span>
              <p className="text-[11px] text-body-color">
                Restricted strictly to <code>staff</code>, <code>manager</code>, <code>support_admin</code>, <code>admin</code>, and <code>super_admin</code> roles via server-side verification.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Navigation..." : "Save Navigation Settings"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
