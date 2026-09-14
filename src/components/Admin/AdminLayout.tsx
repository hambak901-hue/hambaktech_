"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Grid,
  Layers,
  ShoppingBag,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  Server,
  DollarSign,
  GraduationCap,
  ShieldCheck,
  Building2,
  LifeBuoy,
  Bell,
  FileText,
  BarChart3,
  Settings,
  History,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  LogOut,
  UserCheck,
} from "lucide-react";
import BrandLogo from "@/components/Common/BrandLogo";
import platformApi from "@/lib/api-client";

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actionButton?: React.ReactNode;
}

export default function AdminLayout({
  children,
  pageTitle,
  breadcrumbs,
  actionButton,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(platformApi.getCurrentUser());

  useEffect(() => {
    // Ensure admin user representation
    const cur = platformApi.getCurrentUser();
    setUser(cur);

    // Fetch server session
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data?.user) {
          const u = data.data.user;
          const fullName = u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.email;
          setUser((prev) => ({
            ...prev,
            id: u.id,
            fullName,
            email: u.email,
            phone: u.phone || prev.phone,
            role: (u.role.slug as any) || prev.role,
            status: (u.status as any) || prev.status,
          }));
        }
      })
      .catch(() => {
        // graceful fallback to local state
      });
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // safe fallback
    } finally {
      router.push("/signin");
    }
  };

  const navSections = [
    {
      group: "Core & Analytics",
      items: [
        { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard, exact: true },
        { label: "Reports & Metrics", href: "/admin/reports", icon: BarChart3 },
      ],
    },
    {
      group: "User & Finance",
      items: [
        { label: "Users & Accounts", href: "/admin/users", icon: Users },
        { label: "Customer Wallets", href: "/admin/wallets", icon: Wallet },
        { label: "Transactions Ledger", href: "/admin/transactions", icon: ArrowLeftRight },
        { label: "Payment Gateways", href: "/admin/payments", icon: CreditCard },
      ],
    },
    {
      group: "Operations & Requests",
      items: [
        { label: "Orders & Fulfillment", href: "/admin/orders", icon: ShoppingBag },
        { label: "NIN Operations Desk", href: "/admin/nin", icon: ShieldCheck },
        { label: "CAC Liaison Desk", href: "/admin/cac", icon: Building2 },
        { label: "Academy Students", href: "/admin/academy", icon: GraduationCap },
        { label: "Support Tickets", href: "/admin/support", icon: LifeBuoy },
      ],
    },
    {
      group: "Catalog & Infrastructure",
      items: [
        { label: "Services Catalog", href: "/admin/services", icon: Grid },
        { label: "Service Categories", href: "/admin/categories", icon: Layers },
        { label: "External Providers", href: "/admin/providers", icon: Server },
        { label: "Dynamic Pricing", href: "/admin/pricing", icon: DollarSign },
      ],
    },
    {
      group: "Content & System",
      items: [
        { label: "CMS & Announcements", href: "/admin/cms", icon: FileText },
        { label: "Notifications Hub", href: "/admin/notifications", icon: Bell },
        { label: "Audit & Security Logs", href: "/admin/audit-logs", icon: History },
        { label: "System Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const handleRoleToggle = (targetRole: "customer" | "admin") => {
    const updated = platformApi.switchRole(targetRole);
    setUser(updated);
    if (targetRole === "customer") {
      router.push("/dashboard");
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-black text-dark dark:text-white flex flex-col lg:flex-row">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-dark border-r border-stroke dark:border-strokedark flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Branding */}
          <div className="p-5 border-b border-stroke dark:border-strokedark flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-sm">
                H
              </div>
              <div>
                <span className="font-extrabold text-sm text-dark dark:text-white tracking-tight block">
                  HambakTech
                </span>
                <span className="text-[10px] uppercase font-bold text-primary tracking-widest block">
                  Admin Command
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Role & Mode Switcher */}
          <div className="px-4 pt-3 pb-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-dark rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-primary flex items-center gap-1.5 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Desk
              </span>
              <button
                type="button"
                onClick={() => handleRoleToggle("customer")}
                className="text-[11px] font-semibold text-body-color hover:text-dark dark:hover:text-white transition"
              >
                Go to Customer →
              </button>
            </div>
          </div>

          {/* Navigation Links Scroll Area */}
          <nav className="flex-1 p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-200px)]">
            {navSections.map((sec) => (
              <div key={sec.group} className="space-y-1">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-body-color/70 px-3 block">
                  {sec.group}
                </span>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-primary text-white shadow-sm shadow-primary/20"
                          : "text-body-color hover:bg-gray-100 dark:hover:bg-gray-dark hover:text-dark dark:hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-primary"}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-stroke dark:border-strokedark space-y-2">
            <Link
              href="/"
              prefetch={false}
              className="flex items-center justify-between px-3 py-1.5 text-xs text-body-color hover:text-primary transition"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                View Public Site
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out Session
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-dark/95 backdrop-blur-md border-b border-stroke dark:border-strokedark px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-stroke dark:border-strokedark lg:hidden text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-dark"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-body-color">
                <Link href="/admin" prefetch={false} className="hover:text-primary transition font-medium">
                  Admin Command
                </Link>
                {breadcrumbs?.map((b, i) => (
                  <React.Fragment key={i}>
                    <ChevronRight className="w-3 h-3 text-body-color/40" />
                    {b.href ? (
                      <Link href={b.href} prefetch={false} className="hover:text-primary transition">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-dark dark:text-white font-medium">{b.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              {pageTitle && (
                <h1 className="text-base sm:text-lg font-bold text-dark dark:text-white mt-0.5">
                  {pageTitle}
                </h1>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {actionButton}

            {/* Quick Link to Customer Desk */}
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stroke dark:border-strokedark hover:border-primary text-xs font-semibold text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-dark transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span>Customer Portal</span>
            </Link>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-gray-100 dark:bg-gray-dark">
              <div className="w-7 h-7 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center">
                {user.fullName.charAt(0)}
              </div>
              <div className="hidden md:block text-left pr-1.5">
                <p className="text-xs font-bold text-dark dark:text-white leading-tight truncate max-w-[120px]">
                  {user.fullName}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold block leading-tight uppercase">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Sign Out Header Button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl border border-stroke dark:border-strokedark text-body-color hover:text-red-600 hover:border-red-300 dark:hover:border-red-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
