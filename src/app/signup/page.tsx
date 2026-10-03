"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/Common/BrandLogo";
import { getApiUrl } from "@/lib/api-config";
import { ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, MailCheck, GraduationCap, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<"customer" | "student">("customer");
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
    role?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setErrorMessage("Please provide both your First Name and Last Name.");
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

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
      const res = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          email: trimmedEmail,
          phone: trimmedPhone,
          password,
          confirmPassword,
          customerTier,
          roleSlug: accountType,
          termsAccepted,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response was not JSON
      }

      if (!res.ok || !data?.success) {
        if (res.status === 409) {
          throw new Error("An account with this email address or phone number already exists. Please sign in.");
        }
        const serverMsg = data?.error?.message || data?.message;
        if (serverMsg) {
          throw new Error(serverMsg);
        }
        throw new Error(`Registration request returned status ${res.status}. Please check your details and try again.`);
      }

      const { user, verificationToken } = data.data;

      setRegistrationSuccess({
        email: user?.email || trimmedEmail,
        token: verificationToken,
        role: user?.role?.slug || accountType,
      });
    } catch (err: unknown) {
      let msg = "An unexpected error occurred during registration. Please try again.";
      if (err instanceof Error) {
        if (err.message === "Load failed" || err.message === "Failed to fetch" || err.name === "TypeError") {
          msg = "Network connection failed or server did not respond. Please ensure you are connected to the internet and try again.";
        } else {
          msg = err.message;
        }
      }
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
                      onClick={() =>
                        router.push(
                          registrationSuccess.role === "student" ? "/dashboard/academy" : "/dashboard"
                        )
                      }
                      className="w-full sm:w-auto py-3 px-6 rounded-xl border border-primary text-primary hover:bg-primary/10 text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      {registrationSuccess.role === "student" ? (
                        <>
                          <GraduationCap className="w-4 h-4" />
                          <span>Go to Academy Student Portal</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          <span>Proceed to Customer Dashboard</span>
                        </>
                      )}
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
                    {accountType === "student" ? "Create Academy Student Account" : "Create Customer Account"}
                  </h3>
                  <p className="text-body-color mb-6 text-center text-xs">
                    {accountType === "student"
                      ? "Enroll in hands-on courses, book lab workstations, and access certifications."
                      : "Access digital business centre, automated VTU, NIN verification, and CAC services."}
                  </p>

                  {/* Account Type Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6">
                    <button
                      type="button"
                      onClick={() => setAccountType("customer")}
                      className={`p-3 rounded-xl text-left transition flex items-center gap-2.5 ${
                        accountType === "customer"
                          ? "bg-white dark:bg-dark text-dark dark:text-white shadow-sm font-bold"
                          : "text-body-color hover:text-dark dark:hover:text-white"
                      }`}
                    >
                      <User className={`w-4 h-4 ${accountType === "customer" ? "text-primary" : ""}`} />
                      <div>
                        <div className="text-xs font-bold">Customer</div>
                        <div className="text-[10px] opacity-75">Services & VTU</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("student")}
                      className={`p-3 rounded-xl text-left transition flex items-center gap-2.5 ${
                        accountType === "student"
                          ? "bg-white dark:bg-dark text-dark dark:text-white shadow-sm font-bold"
                          : "text-body-color hover:text-dark dark:hover:text-white"
                      }`}
                    >
                      <GraduationCap className={`w-4 h-4 ${accountType === "student" ? "text-primary" : ""}`} />
                      <div>
                        <div className="text-xs font-bold">Academy Student</div>
                        <div className="text-[10px] opacity-75">Courses & Labs</div>
                      </div>
                    </button>
                  </div>

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
