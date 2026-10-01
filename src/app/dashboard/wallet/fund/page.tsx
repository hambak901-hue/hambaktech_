"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Building,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Wallet,
  AlertCircle,
  Lock,
  ExternalLink,
  Copy,
  Info,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];

interface InitializedPayment {
  transactionId: string;
  reference: string;
  txReference?: string;
  authorizationUrl?: string | null;
  amount: number;
  currency: string;
  channel: string;
  metadata?: {
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      reference: string;
      instructions: string;
    };
    [key: string]: any;
  };
}

export default function FundWalletPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("5000");
  const [gateway, setGateway] = useState<"PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT" | "BANK_TRANSFER">("PAYSTACK");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Two-phase funding: Initialized state awaits gateway payment and verification
  const [initializedPayment, setInitializedPayment] = useState<InitializedPayment | null>(null);

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setAmount(Number(val) || 0);
  };

  const handleInitializePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (amount < 100) {
      setErrorMessage("Minimum wallet funding amount is ₦100.00");
      return;
    }

    setProcessing(true);

    try {
      // Idempotency key prevents duplicate funding charges on rapid multi-clicks
      const idempotencyKey = `ht-idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const res = await fetch(getApiUrl("/api/wallet/fund/initialize"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          amount,
          channel: gateway,
          provider: gateway,
          metadata: {
            source: "customer_portal",
            initializedAt: new Date().toISOString(),
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || "Failed to initialize wallet funding session.");
      }

      const paymentData: InitializedPayment = json.data;
      setInitializedPayment(paymentData);

      // If gateway returns an external authorization URL, user can proceed to payment
      if (paymentData.authorizationUrl && paymentData.channel !== "BANK_TRANSFER") {
        // Automatically redirect if desirable, or present the authoritative checkout screen
        // window.location.href = paymentData.authorizationUrl;
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during payment initialization.");
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <DashboardLayout
      pageTitle="Fund Wallet"
      breadcrumbs={[
        { label: "Wallet", href: "/dashboard/wallet" },
        { label: "Fund Wallet" },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        {!initializedPayment ? (
          /* Step 1: Initialize Payment */
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                  Add Funds to HambakTech Wallet
                </h2>
                <p className="text-xs text-body-color">
                  Two-phase secure funding with verified provider settlement
                </p>
              </div>
            </div>

            <form onSubmit={handleInitializePayment} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Preset Amounts */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Select Quick Amount
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetClick(val)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                        amount === val
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-gray-50 dark:bg-gray-dark border-stroke dark:border-strokedark text-dark dark:text-white hover:border-primary"
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Or Enter Custom Amount (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-dark dark:text-white">
                    ₦
                  </span>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomChange}
                    placeholder="e.g. 15,000"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold text-base focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Payment Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Choose Payment Channel
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      gateway === "PAYSTACK"
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value="PAYSTACK"
                      checked={gateway === "PAYSTACK"}
                      onChange={() => setGateway("PAYSTACK")}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-dark dark:text-white block">
                        Paystack Gateway
                      </span>
                      <span className="text-[11px] text-body-color">Cards, USSD, Bank Transfer</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      gateway === "FLUTTERWAVE"
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value="FLUTTERWAVE"
                      checked={gateway === "FLUTTERWAVE"}
                      onChange={() => setGateway("FLUTTERWAVE")}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-dark dark:text-white block">
                        Flutterwave Gateway
                      </span>
                      <span className="text-[11px] text-body-color">Debit Cards & Mobile Money</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      gateway === "MONIEPOINT"
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value="MONIEPOINT"
                      checked={gateway === "MONIEPOINT"}
                      onChange={() => setGateway("MONIEPOINT")}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-dark dark:text-white block">
                        Moniepoint Virtual Account
                      </span>
                      <span className="text-[11px] text-body-color">Dedicated Transfer Account</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      gateway === "BANK_TRANSFER"
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gateway"
                      value="BANK_TRANSFER"
                      checked={gateway === "BANK_TRANSFER"}
                      onChange={() => setGateway("BANK_TRANSFER")}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-dark dark:text-white block">
                        Corporate Bank Transfer
                      </span>
                      <span className="text-[11px] text-body-color">Hambaktech & Services Official Account</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 text-xs text-body-color p-3 rounded-xl bg-gray-50 dark:bg-gray-dark">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protected by two-phase verification and double-entry ledger security.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing || amount <= 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Initializing Secure Payment Session...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Payment of ₦{amount.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Payment Initialized — Continue to Provider or Complete Transfer */
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  Payment Session Initialized
                </span>
                <h2 className="text-xl font-bold text-dark dark:text-white">
                  ₦{initializedPayment.amount.toLocaleString()} {initializedPayment.currency}
                </h2>
              </div>
            </div>

            {/* Session Reference Details */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-body-color">Payment Reference:</span>
                <div className="flex items-center gap-2">
                  <strong className="text-dark dark:text-white font-mono">{initializedPayment.reference}</strong>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(initializedPayment.reference)}
                    className="p-1 text-body-color hover:text-primary transition"
                    title="Copy reference"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-body-color">Channel:</span>
                <strong className="text-dark dark:text-white">{initializedPayment.channel}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-body-color">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                  AWAITING SETTLEMENT
                </span>
              </div>
            </div>

            {copied && (
              <p className="text-[11px] text-emerald-600 font-medium text-center">Reference copied to clipboard!</p>
            )}

            {/* Bank Transfer Instructions if BANK_TRANSFER */}
            {initializedPayment.channel === "BANK_TRANSFER" && initializedPayment.metadata?.bankDetails ? (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 text-xs">
                <h3 className="font-bold text-dark dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  Official Corporate Bank Details
                </h3>
                <div className="space-y-1.5 text-body-color">
                  <p>
                    <strong>Bank Name:</strong> {initializedPayment.metadata.bankDetails.bankName}
                  </p>
                  <p>
                    <strong>Account Number:</strong>{" "}
                    <span className="font-mono text-dark dark:text-white font-bold">
                      {initializedPayment.metadata.bankDetails.accountNumber}
                    </span>
                  </p>
                  <p>
                    <strong>Account Name:</strong> {initializedPayment.metadata.bankDetails.accountName}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 bg-amber-500/10 p-2 rounded-lg">
                    {initializedPayment.metadata.bankDetails.instructions}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Actions: Proceed to Gateway or Verify */}
            <div className="space-y-3 pt-2">
              {initializedPayment.authorizationUrl && initializedPayment.channel !== "BANK_TRANSFER" ? (
                <a
                  href={initializedPayment.authorizationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 transition flex items-center justify-center gap-2"
                >
                  <span>Pay Now on {initializedPayment.channel}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : null}

              <Link
                href={`/dashboard/wallet/verify?reference=${encodeURIComponent(initializedPayment.reference)}`}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Verify & Settle Payment</span>
                <CheckCircle2 className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setInitializedPayment(null)}
                className="w-full py-2.5 px-6 rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-dark transition text-center"
              >
                Cancel & Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
