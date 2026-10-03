"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "@/components/Common/BrandLogo";
import { getApiUrl } from "@/lib/api-config";
import {
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MailCheck,
  PhoneCall,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryToken = searchParams.get("token") || "";
  const initialMode = searchParams.get("mode") === "phone" ? "phone" : "email";

  const [activeTab, setActiveTab] = useState<"email" | "phone">(initialMode);

  // Email Verification State
  const [token, setToken] = useState(queryToken);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  // Phone Verification State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [otpRequesting, setOtpRequesting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");

  // Handle Email Verification
  const handleVerifyEmail = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    setEmailLoading(true);
    setEmailError(null);

    try {
      const res = await fetch(getApiUrl("/api/auth/verify-email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Failed to verify email address.");
      }

      setIsEmailVerified(true);
      setVerifiedEmail(data.data?.email || "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification link is invalid or expired.";
      setEmailError(msg);
      setShowResend(true);
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    if (queryToken) {
      handleVerifyEmail(queryToken);
    }
  }, [queryToken]);

  // Handle Resend Email Token
  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResending(true);
    setResendSuccess(null);
    setEmailError(null);

    try {
      const res = await fetch(getApiUrl("/api/auth/resend-verification"), {
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
      setEmailError(msg);
    } finally {
      setResending(false);
    }
  };

  // Handle Request Phone OTP
  const handleRequestPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setPhoneError("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    setOtpRequesting(true);
    setPhoneError(null);
    setPhoneSuccess(null);

    try {
      const res = await fetch(getApiUrl("/api/auth/verify-phone"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_otp",
          phone: cleanPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Failed to dispatch phone verification code.");
      }

      setOtpSent(true);
      setPhoneSuccess(data.message || `A 6-digit verification code has been sent to ${cleanPhone}.`);
      if (data.data?.otp) {
        // Helpful autofill preview in dev/test
        setPhoneOtp(data.data.otp);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to dispatch verification SMS.";
      setPhoneError(msg);
    } finally {
      setOtpRequesting(false);
    }
  };

  // Handle Verify Phone OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = phoneOtp.trim();
    const cleanPhone = phoneNumber.trim();

    if (!cleanPhone) {
      setPhoneError("Please enter your registered phone number.");
      return;
    }

    if (!cleanOtp || cleanOtp.length < 4) {
      setPhoneError("Please enter the 6-digit verification code.");
      return;
    }

    setPhoneLoading(true);
    setPhoneError(null);

    try {
      const res = await fetch(getApiUrl("/api/auth/verify-phone"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phone: cleanPhone,
          otp: cleanOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Invalid verification code.");
      }

      setIsPhoneVerified(true);
      setVerifiedPhone(data.data?.phone || cleanPhone);
      setPhoneSuccess("Phone number successfully verified!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Phone verification failed.";
      setPhoneError(msg);
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="w-full max-w-[540px]">
            <div className="shadow-three dark:bg-dark rounded-3xl bg-white p-8 sm:p-12 border border-stroke dark:border-strokedark">
              <div className="flex justify-center mb-6">
                <BrandLogo variant="stacked" size="lg" />
              </div>

              {/* Header Title */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-dark dark:text-white mb-2">
                  Account Verification
                </h3>
                <p className="text-body-color text-xs">
                  Verify your email address or mobile phone to activate your account and access your dashboard.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("email")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    activeTab === "email"
                      ? "bg-white dark:bg-dark text-primary shadow-sm"
                      : "text-body-color hover:text-dark dark:hover:text-white"
                  }`}
                >
                  <MailCheck className="w-4 h-4" />
                  <span>Email Verification</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("phone")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    activeTab === "phone"
                      ? "bg-white dark:bg-dark text-primary shadow-sm"
                      : "text-body-color hover:text-dark dark:hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Phone Number (SMS/OTP)</span>
                </button>
              </div>

              {/* TAB 1: EMAIL VERIFICATION */}
              {activeTab === "email" && (
                <div className="space-y-4">
                  {emailError && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{emailError}</div>
                    </div>
                  )}

                  {resendSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{resendSuccess}</div>
                    </div>
                  )}

                  {isEmailVerified ? (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-dark dark:text-white mb-1">
                          Email Address Verified!
                        </h4>
                        <p className="text-body-color text-xs">
                          {verifiedEmail ? (
                            <>Your account <strong>{verifiedEmail}</strong> has been successfully verified.</>
                          ) : (
                            "Your email address is verified."
                          )}
                        </p>
                      </div>
                      <div className="pt-2">
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
                          Verification Token or 6-Digit Code
                        </label>
                        <input
                          type="text"
                          id="token"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="Paste token or enter verification code"
                          className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono text-xs focus:outline-none focus:border-primary transition"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVerifyEmail(token)}
                        disabled={emailLoading || !token.trim()}
                        className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {emailLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying...</span>
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
                                Registered Email Address
                              </label>
                              <input
                                type="email"
                                id="resendEmail"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                placeholder="Enter your registered email"
                                required
                                className="w-full px-3 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-xs"
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
                                "Resend Verification Code"
                              )}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PHONE VERIFICATION */}
              {activeTab === "phone" && (
                <div className="space-y-4">
                  {phoneError && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{phoneError}</div>
                    </div>
                  )}

                  {phoneSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{phoneSuccess}</div>
                    </div>
                  )}

                  {isPhoneVerified ? (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-dark dark:text-white mb-1">
                          Phone Number Verified!
                        </h4>
                        <p className="text-body-color text-xs">
                          Your phone number <strong>{verifiedPhone}</strong> has been successfully verified.
                        </p>
                      </div>
                      <div className="pt-2">
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
                      {/* Step A: Request OTP */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1 text-xs"
                        >
                          Mobile Phone Number
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            id="phone"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="08147837664"
                            className="flex-1 px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono text-xs focus:outline-none focus:border-primary transition"
                          />
                          <button
                            type="button"
                            onClick={handleRequestPhoneOtp}
                            disabled={otpRequesting || !phoneNumber.trim()}
                            className="px-4 py-3 rounded-xl bg-gray-900 dark:bg-gray-800 text-white font-bold text-xs hover:bg-gray-800 dark:hover:bg-gray-700 transition flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                          >
                            {otpRequesting ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>{otpSent ? "Resend" : "Send OTP"}</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Step B: Enter Code */}
                      <div>
                        <label
                          htmlFor="phoneOtp"
                          className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1 text-xs"
                        >
                          6-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          id="phoneOtp"
                          maxLength={6}
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          placeholder="e.g. 123456"
                          className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-mono text-sm tracking-widest text-center focus:outline-none focus:border-primary transition"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={phoneLoading || !phoneNumber.trim() || !phoneOtp.trim()}
                        className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {phoneLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying Phone...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirm Phone Verification</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="text-center pt-6 mt-6 border-t border-stroke dark:border-strokedark">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-body-color hover:text-primary text-xs transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
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
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
