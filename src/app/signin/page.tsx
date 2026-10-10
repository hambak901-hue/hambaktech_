"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "@/components/Common/BrandLogo";
import { getApiUrl } from "@/lib/api-config";
import { setStoredAuthToken } from "@/lib/auth-token";
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "";
  const verifiedNotice = searchParams.get("verified") === "true";
  const resetNotice = searchParams.get("reset") === "true";
  const expiredNotice = searchParams.get("expired") === "true";

  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    verifiedNotice
      ? "Email address verified successfully. Please log in."
      : resetNotice
      ? "Password reset successfully. Please log in with your new password."
      : expiredNotice
      ? "Your session has expired. Please sign in again to continue."
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const trimmedCredential = credential.trim();
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: trimmedCredential,
          credential: trimmedCredential,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error?.message || data.message || "Invalid email address or password.";
        throw new Error(errorMsg);
      }

      const rawData = data.data || {};
      const user = rawData.user || rawData;
      const token = rawData.token;

      if (token) {
        setStoredAuthToken(token);
      }

      // Authoritative server-side role resolution from API response:
      const roleStr = (
        typeof user.role === "string"
          ? user.role
          : user.role?.slug || "customer"
      ).toLowerCase();

      // Determine authoritative destination based strictly on server response
      let destination = "/dashboard";
      if (["super_admin", "admin", "manager", "staff"].includes(roleStr)) {
        destination = "/admin";
      } else if (roleStr === "support_admin" || roleStr === "customer_service") {
        destination = "/admin/support";
      } else if (roleStr === "student") {
        destination = "/dashboard/academy";
      } else if (roleStr === "agent" || roleStr === "corporate" || roleStr === "customer") {
        destination = "/dashboard";
      } else {
        destination = "/dashboard";
      }

      if (redirectTarget) {
        const isTargetAdmin = redirectTarget.startsWith("/admin");
        const isAdminRole = ["super_admin", "admin", "support_admin", "manager", "staff", "customer_service"].includes(roleStr);
        if (isTargetAdmin && !isAdminRole) {
          destination = "/dashboard";
        } else {
          destination = redirectTarget;
        }
      }

      setLoading(false);
      setRedirecting(true);
      setSuccessMessage("Signing in approved. Taking you to your dashboard...");

      // Execute client redirect with fallback for cPanel static hosting
      setTimeout(() => {
        try {
          router.push(destination);
        } catch {
          // fallback
        }
        if (typeof window !== "undefined") {
          window.location.href = destination;
        }
      }, 150);
    } catch (err: unknown) {
      setLoading(false);
      setRedirecting(false);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    }
  };

  return (
    <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="w-full max-w-[500px]">
            <div className="shadow-three dark:bg-dark rounded-3xl bg-white p-8 sm:p-12 border border-stroke dark:border-strokedark">
              <div className="flex justify-center mb-6">
                <BrandLogo variant="stacked" size="lg" />
              </div>
              <h3 className="mb-2 text-center text-2xl font-bold text-dark dark:text-white">
                Sign in to HambakTech
              </h3>
              <p className="text-body-color mb-6 text-center text-xs">
                Server-authenticated access to your digital wallet, services, orders, and portal.
              </p>

              {/* Status Alert Messages */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Authentication Failed:</span> {errorMessage}
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{successMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs" suppressHydrationWarning>
                <div>
                  <label
                    htmlFor="credential"
                    className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                  >
                    Email or Nigerian Phone Number
                  </label>
                  <input
                    type="text"
                    id="credential"
                    name="credential"
                    autoComplete="username"
                    suppressHydrationWarning
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="email@example.com or 08147837664"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="password"
                      className="block font-bold text-dark dark:text-white uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    suppressHydrationWarning
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      suppressHydrationWarning
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-primary border-stroke dark:border-strokedark"
                    />
                    <span className="text-body-color text-xs">Remember session</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline text-xs font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || redirecting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {redirecting ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-pulse" />
                        <span>Redirecting to your dashboard...</span>
                      </>
                    ) : loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Signing you in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In Securely</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark text-center space-y-2">
                <p className="text-body-color text-xs">
                  Don&apos;t have an account yet?{" "}
                  <Link href="/signup" className="text-primary font-bold hover:underline">
                    Create Account (Customer or Student)
                  </Link>
                </p>
                <p className="text-body-color text-xs">
                  Already registered?{" "}
                  <Link href="/verify-email" className="text-primary font-semibold hover:underline">
                    Verify Email or Phone Number
                  </Link>
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-body-color">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Server-Enforced RBAC & Cryptographic Session Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-32">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SigninContent />
    </Suspense>
  );
}
