"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";

const DISCOS = [
  { id: "IKEDC", name: "Ikeja Electric (IKEDC)" },
  { id: "EKEDC", name: "Eko Electricity (EKEDC)" },
  { id: "AEDC", name: "Abuja Electricity (AEDC)" },
  { id: "IBEDC", name: "Ibadan Electricity (IBEDC)" },
  { id: "EEDC", name: "Enugu Electricity (EEDC)" },
  { id: "PHED", name: "Port Harcourt (PHED)" },
  { id: "KEDCO", name: "Kano Electricity (KEDCO)" },
];

export default function PayElectricityPage() {
  const [disco, setDisco] = useState("IKEDC");
  const [meterType, setMeterType] = useState<"PREPAID" | "POSTPAID">("PREPAID");
  const [meterNumber, setMeterNumber] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [amount, setAmount] = useState<number>(3000);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(platformApi.getWallet());
  const [copied, setCopied] = useState(false);

  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    token: string;
    units: string;
    disco: string;
    meterNumber: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  const handleVerifyMeter = () => {
    if (!meterNumber || meterNumber.length < 8) {
      alert("Please enter a valid meter number of at least 8 digits");
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerifiedName("ADEBAYO OLUWASEUN — ORIGANRIGAN CELE, IBEJU-LEKKI");
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meterNumber) {
      alert("Please enter your meter number");
      return;
    }
    if (amount < 500) {
      alert("Minimum electricity purchase is ₦500");
      return;
    }
    if (wallet.currentBalance < amount) {
      alert("Insufficient wallet balance. Please fund your wallet to proceed.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const order = platformApi.purchaseElectricity(disco, meterNumber, meterType, amount);
        const updatedWallet = platformApi.getWallet();
        setWallet(updatedWallet);
        setLoading(false);

        // Generate simulated 20-digit token
        const rawToken = Array.from({ length: 5 }, () =>
          Math.floor(1000 + Math.random() * 9000).toString()
        ).join("-");

        const estimatedUnits = (amount / 68).toFixed(1);

        setSuccessReceipt({
          reference: order.orderNumber,
          token: rawToken,
          units: `${estimatedUnits} kWh`,
          disco,
          meterNumber,
          amount,
          newBalance: updatedWallet.currentBalance,
        });
      } catch (err: any) {
        setLoading(false);
        alert(err.message || "Failed to process electricity token");
      }
    }, 1200);
  };

  const copyToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout
      pageTitle="Prepaid Electricity Token & Utility Pay"
      breadcrumbs={[
        { label: "Services", href: "/dashboard/services" },
        { label: "Electricity" },
      ]}
    >
      <div className="max-w-xl mx-auto">
        {!successReceipt ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                    Electricity Token
                  </h2>
                  <p className="text-xs text-body-color">
                    Instant 20-digit token delivery for all DISCOs
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-body-color block">Wallet Balance</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ₦{wallet.currentBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* DISCO Distribution Company */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                  Select Electricity Provider (DISCO)
                </label>
                <select
                  value={disco}
                  onChange={(e) => {
                    setDisco(e.target.value);
                    setVerifiedName(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-xs sm:text-sm focus:outline-none focus:border-primary font-medium"
                >
                  {DISCOS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meter Type */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Meter Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMeterType("PREPAID")}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      meterType === "PREPAID"
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "border-stroke dark:border-strokedark text-body-color hover:text-dark"
                    }`}
                  >
                    Prepaid (Generate Token)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeterType("POSTPAID")}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      meterType === "POSTPAID"
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "border-stroke dark:border-strokedark text-body-color hover:text-dark"
                    }`}
                  >
                    Postpaid (Bill Settle)
                  </button>
                </div>
              </div>

              {/* Meter Number with Verify Button */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                  Meter Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={meterNumber}
                    onChange={(e) => {
                      setMeterNumber(e.target.value.replace(/[^0-9]/g, ""));
                      setVerifiedName(null);
                    }}
                    placeholder="Enter 11 or 13-digit meter number"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-sm focus:outline-none focus:border-primary font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyMeter}
                    disabled={verifying || !meterNumber}
                    className="px-4 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white font-bold text-xs transition shrink-0 disabled:opacity-50"
                  >
                    {verifying ? "Verifying..." : "Validate"}
                  </button>
                </div>

                {verifiedName && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Customer: <strong>{verifiedName}</strong></span>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                  Amount to Purchase (₦)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  min={500}
                  step={100}
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-sm focus:outline-none focus:border-primary font-bold"
                />
              </div>

              {/* Phone for SMS Token */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                  Notification Phone (SMS Token)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                  placeholder="e.g. 08147837664"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || amount < 500 || !meterNumber}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating DISCO Token...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Electricity Token (₦{amount.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Token Delivery Display */
          <div className="p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <Zap className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Electricity Token Generated
              </span>
              <p className="text-xs text-body-color mt-1">
                Meter Number: <strong className="text-dark dark:text-white">{successReceipt.meterNumber}</strong> ({successReceipt.disco})
              </p>
            </div>

            {/* 20-digit token banner */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 text-center space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Prepaid Token (20 Digits)
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-dark dark:text-white tracking-wider">
                {successReceipt.token}
              </div>
              <p className="text-xs text-body-color">Estimated Energy Units: {successReceipt.units}</p>

              <button
                type="button"
                onClick={() => copyToken(successReceipt.token)}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Token"}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark text-xs text-body-color space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span>Order Ref:</span>
                <strong className="text-dark dark:text-white">{successReceipt.reference}</strong>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <strong className="text-dark dark:text-white">₦{successReceipt.amount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Wallet Balance:</span>
                <strong className="text-emerald-600">₦{successReceipt.newBalance.toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/orders"
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm"
              >
                View Official Receipt
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessReceipt(null);
                  setMeterNumber("");
                }}
                className="px-6 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-dark transition"
              >
                Buy Another Meter Token
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
