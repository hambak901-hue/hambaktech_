"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/Common/BrandLogo";
import platformApi from "@/lib/api-client";
import { ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("customer@hambaktech.com.ng");
  const [password, setPassword] = useState("password123");
  const [roleChoice, setRoleChoice] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      platformApi.switchRole(roleChoice);
      setLoading(false);
      if (roleChoice === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }, 600);
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
              <p className="text-body-color mb-8 text-center text-xs">
                Access your customer wallet, active service requests, and receipts.
              </p>

              {/* Portal Selector Tab */}
              <div className="mb-6 p-1 rounded-2xl bg-gray-100 dark:bg-gray-dark border border-stroke dark:border-strokedark grid grid-cols-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setRoleChoice("CUSTOMER");
                    setEmail("customer@hambaktech.com.ng");
                  }}
                  className={`py-2 rounded-xl transition ${
                    roleChoice === "CUSTOMER"
                      ? "bg-white dark:bg-dark text-primary shadow-sm"
                      : "text-body-color hover:text-dark dark:hover:text-white"
                  }`}
                >
                  Customer Portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleChoice("ADMIN");
                    setEmail("admin@hambaktech.com.ng");
                  }}
                  className={`py-2 rounded-xl transition ${
                    roleChoice === "ADMIN"
                      ? "bg-white dark:bg-dark text-primary shadow-sm"
                      : "text-body-color hover:text-dark dark:hover:text-white"
                  }`}
                >
                  Admin Console
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium"
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
                    <a
                      href="#0"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Password reset instructions sent to email.");
                      }}
                      className="text-primary hover:underline text-[11px]"
                    >
                      Forgot?
                    </a>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary text-sm font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Authenticating Session...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter {roleChoice === "ADMIN" ? "Admin Console" : "Dashboard"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-body-color text-center text-xs mt-6">
                Don&apos;t have an account yet?{" "}
                <Link href="/signup" className="text-primary font-bold hover:underline">
                  Create Customer Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
