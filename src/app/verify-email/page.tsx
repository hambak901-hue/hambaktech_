"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "@/components/Common/BrandLogo";
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, MailCheck, ArrowLeft } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryToken = searchParams.get("token") || "";

  const [token, setToken] = useState(queryToken);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const handleVerify = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Failed to verify email address.");
      }

      setIsVerified(true);
      setVerifiedEmail(data.data?.email || "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification link is invalid or expired.";
      setErrorMessage(msg);
      setShowResend(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryToken) {
      handleVerify(queryToken);
    }
  }, [queryToken]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResending(true);
    setResendSuccess(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Could not resend verification email.");
      }

      setResendSuccess(
        data.data?.message || "A new verification email has been dispatched. Please check your inbox."
      );
      if (data.data?.verificationToken) {
        setToken(data.data.verificationToken);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend verification.";
      setErrorMessage(msg);
    } finally {
      setResending(false);
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
                <MailCheck className="w-6 h-6" />
              </div>

              <h3 className="mb-2 text-center text-2xl font-bold text-dark dark:text-white">
                Email Verification
              </h3>
              <p className="text-body-color mb-8 text-center text-xs">
                Activate your HambakTech customer profile and unlock full service features.
              </p>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {resendSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{resendSuccess}</div>
                </div>
              )}

              {isVerified ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-dark dark:text-white mb-2">
                    Email Address Verified!
                  </h4>
                  <p className="text-body-color text-xs mb-6">
                    {verifiedEmail ? (
                      <>
                        Your account associated with <strong>{verifiedEmail}</strong> has been successfully verified.
                      </>
                    ) : (
                      "Your account has been successfully verified."
                    )}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/signin?verified=true"
                      className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2"
                    >
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="token"
                      className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1 text-xs"
                    >
                      Verification Token
                    </label>
                    <input
                      type="text"
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste token or click link from email"
                      className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono text-xs focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerify(token)}
                    disabled={loading || !token.trim()}
                    className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Token...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Email Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Resend Section */}
                  <div className="pt-4 border-t border-stroke dark:border-strokedark text-center text-xs">
                    {!showResend ? (
                      <button
                        type="button"
                        onClick={() => setShowResend(true)}
                        className="text-primary hover:underline font-semibold"
                      >
                        Didn&apos;t receive token or token expired? Request a new one
                      </button>
                    ) : (
                      <form onSubmit={handleResend} className="space-y-3 text-left">
                        <div>
                          <label
                            htmlFor="resendEmail"
                            className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1 text-[11px]"
                          >
                            Account Email Address
                          </label>
                          <input
                            type="email"
                            id="resendEmail"
                            value={resendEmail}
                            onChange={(e) => setResendEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            required
                            className="w-full px-3 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-xs"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={resending}
                          className="w-full py-2.5 px-4 rounded-xl bg-gray-900 dark:bg-gray-800 text-white font-bold text-xs hover:bg-gray-800 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                        >
                          {resending ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Resend Verification Link"
                          )}
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="text-center pt-2">
                    <Link
                      href="/signin"
                      className="inline-flex items-center gap-2 text-body-color hover:text-primary text-xs transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pt-32">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
