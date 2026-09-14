"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/Common/BrandLogo";
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    message: string;
    token?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Failed to process password reset request.");
      }

      setResult({
        message: data.data?.message || "Password recovery instructions have been sent to your email address.",
        token: data.data?.resetToken,
      });
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
                <KeyRound className="w-6 h-6" />
              </div>

              <h3 className="mb-2 text-center text-2xl font-bold text-dark dark:text-white">
                Password Recovery
              </h3>
              <p className="text-body-color mb-8 text-center text-xs">
                Enter your registered account email to generate a secure reset link.
              </p>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {result ? (
                <div className="text-center py-2">
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs text-left">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>{result.message}</div>
                  </div>

                  {result.token && (
                    <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark text-left">
                      <span className="text-[11px] font-bold text-body-color uppercase tracking-wider block mb-2">
                        Reset Token Generated
                      </span>
                      <p className="font-mono text-xs text-dark dark:text-white break-all bg-white dark:bg-dark p-2 rounded-lg border border-stroke dark:border-strokedark mb-3">
                        {result.token}
                      </p>
                      <Link
                        href={`/reset-password?token=${encodeURIComponent(result.token)}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                      >
                        Reset Password With This Token
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}

                  <Link
                    href="/signin"
                    className="inline-flex items-center gap-2 text-primary text-xs font-bold hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Sign In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs" suppressHydrationWarning>
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                    >
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      suppressHydrationWarning
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. customer@hambaktech.com.ng"
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
                          <span>Generating Reset Token...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Password Reset Instructions</span>
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
