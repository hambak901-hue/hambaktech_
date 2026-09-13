"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  Grid,
  ShieldCheck,
  Building2,
  GraduationCap,
  LifeBuoy,
  Bell,
  User,
  Lock,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Plus,
  ArrowUpRight,
  LogOut,
  Smartphone,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import platformApi from "@/lib/api-client";
import BrandLogo from "@/components/Common/BrandLogo";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function DashboardLayout({
  children,
  pageTitle,
  breadcrumbs,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(platformApi.getCurrentUser());
  const [wallet, setWallet] = useState(platformApi.getWallet());

  useEffect(() => {
    // Refresh user and wallet state
    const currentUser = platformApi.getCurrentUser();
    setUser(currentUser);
    setWallet(platformApi.getWallet());
  }, [pathname]);

  const navItems = [
    {
      label: "Dashboard Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Wallet & Ledger",
      href: "/dashboard/wallet",
      icon: Wallet,
      badge: `₦${wallet.currentBalance.toLocaleString()}`,
    },
    {
      label: "My Orders & Receipts",
      href: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      label: "Digital Services Hub",
      href: "/dashboard/services",
      icon: Grid,
    },
    {
      label: "VTU & Utility Bills",
      href: "/dashboard/services/airtime",
      icon: Smartphone,
    },
    {
      label: "NIN Centre Desk",
      href: "/dashboard/nin",
      icon: ShieldCheck,
    },
    {
      label: "CAC Business Registration",
      href: "/dashboard/cac",
      icon: Building2,
    },
    {
      label: "Academy Student Portal",
      href: "/dashboard/academy",
      icon: GraduationCap,
    },
    {
      label: "Support Tickets",
      href: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      label: "Security & PIN",
      href: "/dashboard/security",
      icon: Lock,
    },
    {
      label: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
    },
  ];

  const handleRoleToggle = (targetRole: "customer" | "admin") => {
    const updated = platformApi.switchRole(targetRole);
    setUser(updated);
    if (targetRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-black text-dark dark:text-white flex flex-col lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-dark border-r border-stroke dark:border-strokedark flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="p-6 border-b border-stroke dark:border-strokedark flex items-center justify-between">
            <BrandLogo showSlogan={false} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-dark text-body-color lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Quick Banner */}
          <div className="p-4 mx-4 mt-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-dark dark:text-white truncate">{user.fullName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-medium text-body-color uppercase tracking-wider capitalize">
                    {user.role} Account
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Balance Preview */}
            <div className="mt-3 pt-3 border-t border-primary/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-body-color">Wallet Balance</span>
                <p className="text-sm font-bold text-primary dark:text-primary">
                  ₦{wallet.currentBalance.toLocaleString()}
                </p>
              </div>
              <Link
                href="/dashboard/wallet/fund"
                prefetch={false}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Fund</span>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-340px)]">
            {navItems.map((item) => {
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-body-color dark:text-body-color-dark hover:bg-gray-100 dark:hover:bg-gray-dark hover:text-dark dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-primary"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Role Switcher */}
        <div className="p-4 border-t border-stroke dark:border-strokedark space-y-2">
          {/* Quick Demo Role Switcher */}
          <div className="p-2.5 bg-gray-100 dark:bg-gray-dark rounded-xl">
            <span className="text-[10px] uppercase font-bold text-body-color block mb-1.5">
              Portal View Switcher
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleRoleToggle("customer")}
                className={`py-1 text-xs font-semibold rounded-lg transition ${
                  user.role === "customer"
                    ? "bg-white dark:bg-dark text-primary shadow-sm"
                    : "text-body-color hover:text-dark"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle("admin")}
                className={`py-1 text-xs font-semibold rounded-lg transition ${
                  user.role === "admin"
                    ? "bg-primary text-white shadow-sm"
                    : "text-body-color hover:text-primary"
                }`}
              >
                Admin Desk
              </button>
            </div>
          </div>

          {/* Link back to public site */}
          <Link
            href="/"
            prefetch={false}
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-body-color hover:text-primary transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Public Website
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-dark/90 backdrop-blur-md border-b border-stroke dark:border-strokedark px-4 sm:px-8 py-3.5 flex items-center justify-between">
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
                <Link href="/dashboard" prefetch={false} className="hover:text-primary transition">
                  Dashboard
                </Link>
                {breadcrumbs?.map((b, i) => (
                  <React.Fragment key={i}>
                    <ChevronRight className="w-3 h-3 text-body-color/50" />
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
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Quick Wallet Action */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Wallet:
              </span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                ₦{wallet.currentBalance.toLocaleString()}
              </span>
              <Link
                href="/dashboard/wallet/fund"
                className="ml-1 text-[11px] font-bold text-primary hover:underline"
              >
                + Fund
              </Link>
            </div>

            {/* Notification Bell */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 rounded-xl border border-stroke dark:border-strokedark text-body-color hover:text-primary hover:border-primary transition"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            </Link>

            {/* User Dropdown / Profile shortcut */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-dark transition"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                {user.fullName.charAt(0)}
              </div>
              <span className="text-xs font-semibold hidden md:inline">{user.fullName.split(" ")[0]}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
