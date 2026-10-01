"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Wallet,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

interface VerificationResult {
  status: "SUCCESSFUL" | "PENDING" | "FAILED" | "CONFIGURATION_ERROR" | string;
  alreadySettled?: boolean;
  reference: string;
  amount: number;
  message?: string;
  credit?: {
    walletId: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reference: string;
  };
  wallet?: {
    id: string;
    currentBalance: number;
    ledgerBalance: number;
    currency: string;
    status: string;
  };
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const verifyPayment = React.useCallback(async (refToVerify: string) => {
    if (!refToVerify) {
      setError("No transaction reference provided in verification query.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(getApiUrl("/api/wallet/fund/verify"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ reference: refToVerify }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || "Unable to authoritatively verify payment with gateway.");
      }

      setResult(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to communicate with verification service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (reference) {
      verifyPayment(reference);
    } else {
      setLoading(false);
      setError("Missing payment reference. Please provide a reference to verify.");
    }
  }, [reference, verifyPayment]);

  return (
    <div className="max-w-xl mx-auto">
      {loading ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-dark dark:text-white">
            Verifying Authoritative Settlement
          </h2>
          <p className="text-xs text-body-color max-w-sm mx-auto">
            Confirming transaction settlement with the payment provider. Checking reference{" "}
            <span className="font-mono font-semibold text-dark dark:text-white">{reference || "..."}</span>
          </p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-white">Verification Error</h2>
            <p className="text-xs text-body-color mt-1">{error}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {reference && (
              <button
                type="button"
                onClick={() => verifyPayment(reference)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition"
              >
                Retry Verification
              </button>
            )}
            <Link
              href="/dashboard/wallet/fund"
              className="px-5 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-dark transition"
            >
              Back to Funding
            </Link>
          </div>
        </div>
      ) : result?.status === "SUCCESSFUL" ? (
        /* Authoritative Settlement Success */
        <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Payment Authoritatively Settled
            </span>
            <h2 className="text-3xl font-extrabold text-dark dark:text-white mt-1">
              +₦{Number(result.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-body-color mt-1">
              Reference: <strong className="text-dark dark:text-white font-mono">{result.reference}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark text-xs text-body-color space-y-2.5 text-left max-w-sm mx-auto">
            <div className="flex justify-between">
              <span>Status:</span>
              <strong className="text-emerald-600 font-bold">CONFIRMED (CREDITED)</strong>
            </div>
            {result.wallet && (
              <div className="flex justify-between">
                <span>Updated Available Balance:</span>
                <strong className="text-dark dark:text-white font-bold">
                  ₦{Number(result.wallet.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
            )}
            <div className="flex justify-between">
              <span>Ledger Verified:</span>
              <strong className="text-dark dark:text-white">Double-Entry Certified</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/dashboard/wallet"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm"
            >
              <Wallet className="w-4 h-4" />
              <span>Go to Wallet</span>
            </Link>
            <Link
              href="/dashboard/wallet/transactions"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-dark transition"
            >
              <FileText className="w-4 h-4" />
              <span>View Transactions</span>
            </Link>
          </div>
        </div>
      ) : result?.status === "PENDING" ? (
        /* Pending Settlement */
        <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Payment Awaiting Settlement
            </span>
            <h2 className="text-xl font-bold text-dark dark:text-white mt-1">
              Transaction Still Processing
            </h2>
            <p className="text-xs text-body-color mt-2 max-w-sm mx-auto">
              {result.message || "The payment gateway has not confirmed settlement yet. If you have already paid, settlement will reflect once verified or when the provider webhook arrives."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => verifyPayment(result.reference)}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check Status Again</span>
            </button>
            <Link
              href="/dashboard/wallet"
              className="px-5 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-dark transition text-center"
            >
              Return to Wallet
            </Link>
          </div>
        </div>
      ) : (
        /* Failed or other non-success state */
        <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              Payment Not Successful
            </span>
            <h2 className="text-xl font-bold text-dark dark:text-white mt-1">
              Status: {result?.status || "FAILED"}
            </h2>
            <p className="text-xs text-body-color mt-2 max-w-sm mx-auto">
              {result?.message || "Payment verification declined or could not be completed with the provider."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/dashboard/wallet/fund"
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition text-center"
            >
              Try Funding Again
            </Link>
            <Link
              href="/dashboard/wallet"
              className="px-5 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-dark transition text-center"
            >
              Go to Wallet
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletVerifyPage() {
  return (
    <DashboardLayout
      pageTitle="Payment Verification"
      breadcrumbs={[
        { label: "Wallet", href: "/dashboard/wallet" },
        { label: "Verification" },
      ]}
    >
      <Suspense
        fallback={
          <div className="p-12 text-center text-xs text-body-color flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading verification parameters...</span>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </DashboardLayout>
  );
}
