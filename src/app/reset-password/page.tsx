"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "@/components/Common/BrandLogo";
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Lock, ArrowLeft } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryToken = searchParams.get("token") || "";

  const [token, setToken] = useState(queryToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (queryToken) {
      setToken(queryToken);
    }
  }, [queryToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Failed to reset password.");
      }

      setIsSuccess(true);
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

              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>

              <h3 className="mb-2 text-center text-2xl font-bold text-dark dark:text-white">
                Set New Password
              </h3>
              <p className="text-body-color mb-8 text-center text-xs">
                Enter your reset token and your secure new password.
              </p>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {isSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-dark dark:text-white mb-2">
                    Password Reset Complete
                  </h4>
                  <p className="text-body-color text-xs mb-6">
                    Your password has been updated. All previous active sessions have been securely terminated.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/signin?reset=true")}
                    className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2"
                  >
                    <span>Sign In With New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs" suppressHydrationWarning>
                  <div>
                    <label
                      htmlFor="token"
                      className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                    >
                      Reset Token
                    </label>
                    <input
                      type="text"
                      id="token"
                      name="token"
                      suppressHydrationWarning
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your 64-character token"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono text-xs focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      autoComplete="new-password"
                      suppressHydrationWarning
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      suppressHydrationWarning
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                    />
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
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <span>Save New Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-4">
                    <Link
                      href="/signin"
                      className="inline-flex items-center gap-2 text-body-color hover:text-primary text-xs transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-32">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
