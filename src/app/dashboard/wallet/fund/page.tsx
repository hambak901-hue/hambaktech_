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
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import companyConfig from "@/data/companyConfig";

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];

export default function FundWalletPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("5000");
  const [gateway, setGateway] = useState<"PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT" | "BANK_TRANSFER">("PAYSTACK");
  const [processing, setProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    reference: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setAmount(Number(val) || 0);
  };

  const handleProceedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 100) {
      alert("Minimum wallet funding amount is ₦100");
      return;
    }

    setProcessing(true);

    // Simulate realistic payment gateway interaction
    setTimeout(() => {
      const generatedRef = `HT-FUND-${Date.now().toString().slice(-8)}`;
      const result = platformApi.fundWallet(amount, gateway, generatedRef);

      setProcessing(false);
      setSuccessResult({
        reference: generatedRef,
        amount,
        newBalance: result.newBalance,
      });
    }, 1200);
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
        {!successResult ? (
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
                  Immediate credit with zero hidden charges
                </p>
              </div>
            </div>

            <form onSubmit={handleProceedPayment} className="space-y-6">
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
                        Paystack (Cards / USSD / Bank)
                      </span>
                      <span className="text-[11px] text-body-color">Instant automated crediting</span>
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
                        Flutterwave Checkout
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
                      <span className="text-[11px] text-body-color">Direct Dynamic Bank Transfer</span>
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
                        Manual Bank Transfer
                      </span>
                      <span className="text-[11px] text-body-color">Hambaktech & Services Account</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 text-xs text-body-color p-3 rounded-xl bg-gray-50 dark:bg-gray-dark">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PCI-DSS compliant 256-bit encrypted simulated gateway transaction.</span>
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
                    <span>Processing Gateway Authorization...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize Payment of ₦{amount.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Wallet Credited Successfully
              </span>
              <h2 className="text-2xl font-bold text-dark dark:text-white mt-1">
                +₦{successResult.amount.toLocaleString()}
              </h2>
              <p className="text-xs text-body-color mt-1">
                Transaction Reference: <strong className="text-dark dark:text-white">{successResult.reference}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark text-xs text-body-color space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span>New Available Balance:</span>
                <strong className="text-dark dark:text-white">₦{successResult.newBalance.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Channel:</span>
                <strong className="text-dark dark:text-white">{gateway}</strong>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <strong className="text-emerald-600">CONFIRMED</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/wallet"
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm"
              >
                Back to Wallet
              </Link>
              <button
                type="button"
                onClick={() => setSuccessResult(null)}
                className="px-6 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-dark transition"
              >
                Make Another Top-up
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
