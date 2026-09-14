"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/Common/BrandLogo";
import platformApi from "@/lib/api-client";
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, MailCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [customerTier, setCustomerTier] = useState<"STANDARD" | "AGENT" | "CORPORATE">("STANDARD");
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    email: string;
    token?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("You must accept the Terms of Service to register.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          confirmPassword,
          customerTier,
          roleSlug: "customer",
          termsAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Registration failed. Please verify your details.");
      }

      const { user, verificationToken } = data.data;

      // Update transitional client store
      if (user) {
        platformApi.updateUserProfile({
          name: `${firstName} ${lastName}`.trim(),
          email: user.email,
          phone: user.phone || phone,
        });
        platformApi.switchRole("CUSTOMER");
      }

      setRegistrationSuccess({
        email: user.email,
        token: verificationToken,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during registration.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="w-full max-w-[560px]">
            <div className="shadow-three dark:bg-dark rounded-3xl bg-white p-8 sm:p-12 border border-stroke dark:border-strokedark">
              <div className="flex justify-center mb-6">
                <BrandLogo variant="stacked" size="lg" />
              </div>

              {registrationSuccess ? (
                /* Registration Success / Email Verification Prompt */
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <MailCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-dark dark:text-white mb-2">
                    Account Created Successfully!
                  </h3>
                  <p className="text-body-color text-sm mb-6 leading-relaxed">
                    We have created your user record, personal profile, and digital wallet. An email verification token has been generated for:
                    <br />
                    <strong className="text-dark dark:text-white">{registrationSuccess.email}</strong>
                  </p>

                  {/* Verification Token Preview Card for instant testing */}
                  {registrationSuccess.token && (
                    <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-body-color uppercase tracking-wider">
                          Email Verification Token
                        </span>
                        <span className="text-[11px] text-primary font-semibold">Instant Test Link</span>
                      </div>
                      <p className="font-mono text-xs text-dark dark:text-white break-all bg-white dark:bg-dark p-2 rounded-lg border border-stroke dark:border-strokedark mb-3">
                        {registrationSuccess.token}
                      </p>
                      <Link
                        href={`/verify-email?token=${encodeURIComponent(registrationSuccess.token)}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Verify Email Now & Activate Account
                      </Link>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard")}
                      className="w-full sm:w-auto py-3 px-6 rounded-xl border border-primary text-primary hover:bg-primary/10 text-xs font-bold transition"
                    >
                      Proceed to Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/signin")}
                      className="w-full sm:w-auto py-3 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition"
                    >
                      Go to Sign In
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <>
                  <h3 className="mb-2 text-center text-2xl font-bold text-dark dark:text-white">
                    Create Customer Account
                  </h3>
                  <p className="text-body-color mb-8 text-center text-xs">
                    Access digital services, automated VTU, NIN verification, and academy courses.
                  </p>

                  {errorMessage && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Error:</span> {errorMessage}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 text-xs" suppressHydrationWarning>
                    {/* First & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                          suppressHydrationWarning
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Abubakar"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          autoComplete="family-name"
                          suppressHydrationWarning
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Ibrahim"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="email"
                          className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          autoComplete="email"
                          suppressHydrationWarning
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                        >
                          Nigerian Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          autoComplete="tel"
                          suppressHydrationWarning
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="08147837664"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                        />
                      </div>
                    </div>

                    {/* Customer Account Tier */}
                    <div>
                      <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                        Account Tier
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["STANDARD", "AGENT", "CORPORATE"] as const).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setCustomerTier(tier)}
                            className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition ${
                              customerTier === tier
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "border-stroke dark:border-strokedark text-body-color hover:border-primary"
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Password & Confirm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="password"
                          className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          autoComplete="new-password"
                          suppressHydrationWarning
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 8 chars, 1 upper, 1 digit"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1"
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          autoComplete="new-password"
                          suppressHydrationWarning
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium transition"
                        />
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        name="terms"
                        suppressHydrationWarning
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="w-4 h-4 rounded text-primary border-stroke dark:border-strokedark"
                      />
                      <label htmlFor="terms" className="text-body-color text-xs cursor-pointer">
                        I agree to HambakTech Terms of Service, Privacy Policy, and KYC Requirements
                      </label>
                    </div>

                    {/* Submit button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Creating Account & Initializing Wallet...</span>
                          </>
                        ) : (
                          <>
                            <span>Complete Registration</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark text-center">
                    <p className="text-body-color text-xs">
                      Already registered?{" "}
                      <Link href="/signin" className="text-primary font-bold hover:underline">
                        Sign in here
                      </Link>
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-body-color">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Automatic Dedicated Digital Wallet & Profile Initialization</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
