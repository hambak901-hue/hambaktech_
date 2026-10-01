"use client";

import React, { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/Common/BrandLogo";
import { getApiUrl } from "@/lib/api-config";
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"REQUEST" | "RESET" | "SUCCESS">("REQUEST");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Request 6-digit OTP code via email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(getApiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok && !data.success) {
        throw new Error(data.error?.message || data.message || "Unable to process password reset request.");
      }

      setSuccessMessage(
        data.data?.message ||
          "If an account is associated with this email, a 6-digit verification code has been dispatched."
      );
      setStep("RESET");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setErrorMessage("Please enter a valid 6-digit numerical verification code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          token: otp.trim(),
          newPassword,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || (!data.success && data.error)) {
        throw new Error(data.error?.message || data.message || "Invalid or expired verification code.");
      }

      setStep("SUCCESS");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed. Please try again.";
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
                {step === "SUCCESS" ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> : <KeyRound className="w-6 h-6" />}
              </div>

              <h3 className="mb-2 text-center text-2xl font-bold text-dark dark:text-white">
                {step === "SUCCESS"
                  ? "Password Updated"
                  : step === "RESET"
                  ? "Enter Verification Code"
                  : "Password Recovery"}
              </h3>
              <p className="text-body-color mb-8 text-center text-xs">
                {step === "SUCCESS"
                  ? "Your account credentials have been securely updated."
                  : step === "RESET"
                  ? `Enter the 6-digit code sent to ${email} and choose your new password.`
                  : "Enter your registered account email to receive a secure 6-digit OTP code."}
              </p>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {successMessage && step === "RESET" && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{successMessage}</div>
                </div>
              )}

              {step === "REQUEST" && (
                <form onSubmit={handleRequestOtp} className="space-y-4 text-xs" suppressHydrationWarning>
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
                          <span>Dispatching Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send 6-Digit OTP Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === "RESET" && (
                <form onSubmit={handleResetPassword} className="space-y-4 text-xs" suppressHydrationWarning>
                  <div>
                    <label
                      htmlFor="otp"
                      className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                    >
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 849201"
                      required
                      className="w-full px-4 py-3 text-center tracking-[8px] font-mono text-lg font-bold rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-primary focus:outline-none focus:border-primary transition"
                    />
                    <span className="text-[10px] text-body-color mt-1 block text-center">
                      Code expires in 15 minutes. Check spam folder if not in inbox.
                    </span>
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
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      required
                      minLength={8}
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
                          <span>Verify Code & Reset Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("REQUEST")}
                      className="text-primary text-xs font-semibold hover:underline"
                    >
                      Request a new code
                    </button>
                  </div>
                </form>
              )}

              {step === "SUCCESS" && (
                <div className="text-center py-2 space-y-6">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs">
                    Your password has been securely reset. All previous sessions have been invalidated. You may now sign in.
                  </div>

                  <Link
                    href="/signin"
                    className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-stroke dark:border-strokedark text-center">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-body-color hover:text-primary text-xs font-bold transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
