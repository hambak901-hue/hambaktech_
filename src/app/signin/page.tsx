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

  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    verifiedNotice
      ? "Email address verified successfully. Please log in."
      : resetNotice
      ? "Password reset successfully. Please log in with your new password."
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
        body: JSON.stringify({
          email: trimmedCredential,
          credential: trimmedCredential,
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Invalid email address or password.");
      }

      const { user, token } = data.data;

      if (token) {
        setStoredAuthToken(token);
      }

      // Authoritative server-side role resolution
      const roleStr = (typeof user.role === "string" ? user.role : user.role?.slug || "customer").toLowerCase();

      if (redirectTarget) {
        // Enforce role authorization on redirect target
        const isTargetAdmin = redirectTarget.startsWith("/admin");
        const isAdminRole = ["super_admin", "admin", "staff", "customer_service"].includes(roleStr);
        if (isTargetAdmin && !isAdminRole) {
          router.push("/dashboard");
        } else {
          router.push(redirectTarget);
        }
      } else if (["super_admin", "admin", "staff"].includes(roleStr)) {
        router.push("/admin");
      } else if (roleStr === "customer_service") {
        router.push("/admin/support");
      } else if (roleStr === "student") {
        router.push("/dashboard/academy");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
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
                    <span className="text-body-color text-xs">Remember session (30 days)</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validating Credentials...</span>
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

              <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark text-center">
                <p className="text-body-color text-xs">
                  Don&apos;t have an account yet?{" "}
                  <Link href="/signup" className="text-primary font-bold hover:underline">
                    Create Customer Account
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
