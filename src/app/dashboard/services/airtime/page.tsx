"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";

const NETWORKS = [
  { id: "MTN", name: "MTN Nigeria", color: "bg-yellow-400 text-yellow-950", discount: "2% Discount" },
  { id: "AIRTEL", name: "Airtel Nigeria", color: "bg-red-500 text-white", discount: "2% Discount" },
  { id: "GLO", name: "Glo Nigeria", color: "bg-emerald-600 text-white", discount: "3% Discount" },
  { id: "9MOBILE", name: "9mobile", color: "bg-lime-600 text-white", discount: "2% Discount" },
];

const PRESETS = [100, 200, 500, 1000, 2000, 5000];

export default function BuyAirtimePage() {
  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("500");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(platformApi.getWallet());
  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    network: string;
    phone: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  const handlePreset = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      alert("Please enter a valid 11-digit phone number");
      return;
    }
    if (amount < 50) {
      alert("Minimum airtime recharge is ₦50");
      return;
    }
    if (wallet.currentBalance < amount) {
      alert("Insufficient wallet balance. Please fund your wallet to proceed.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const order = platformApi.purchaseAirtime(network, phone, amount);
        const updatedWallet = platformApi.getWallet();
        setWallet(updatedWallet);
        setLoading(false);
        setSuccessReceipt({
          reference: order.orderNumber,
          network,
          phone,
          amount,
          newBalance: updatedWallet.currentBalance,
        });
      } catch (err: any) {
        setLoading(false);
        alert(err.message || "Failed to process airtime recharge");
      }
    }, 1000);
  };

  return (
    <DashboardLayout
      pageTitle="Instant Airtime Recharge"
      breadcrumbs={[
        { label: "Services", href: "/dashboard/services" },
        { label: "Airtime" },
      ]}
    >
      <div className="max-w-xl mx-auto">
        {!successReceipt ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                    Airtime Top-up
                  </h2>
                  <p className="text-xs text-body-color">
                    Direct automated crediting in seconds
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
              {/* Network Selector */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Select Mobile Network
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setNetwork(net.id)}
                      className={`p-3 rounded-xl border text-center transition ${
                        network === net.id
                          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                          : "border-stroke dark:border-strokedark hover:border-gray-300"
                      }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${net.color}`}>
                        {net.id}
                      </span>
                      <span className="text-[10px] text-body-color block mt-1">{net.discount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Phone */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                  Recipient Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
                  placeholder="e.g. 08147837664"
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Preset Amounts */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Select Recharge Amount
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESETS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePreset(val)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                        amount === val
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-gray-50 dark:bg-gray-dark border-stroke dark:border-strokedark text-dark dark:text-white hover:border-primary"
                      }`}
                    >
                      ₦{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                  Or Enter Amount (₦)
                </label>
                <input
                  type="text"
                  value={customAmount}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, "");
                    setCustomAmount(clean);
                    setAmount(Number(clean) || 0);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-sm focus:outline-none focus:border-primary font-bold"
                />
              </div>

              {/* Wallet info */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark flex items-center justify-between text-xs">
                <span className="text-body-color">Total Payable from Wallet:</span>
                <span className="font-extrabold text-dark dark:text-white text-sm">
                  ₦{amount.toLocaleString()}
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || amount <= 0 || !phone}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Recharging {network} Line...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay ₦{amount.toLocaleString()}</span>
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
                Airtime Recharge Successful
              </span>
              <h2 className="text-2xl font-bold text-dark dark:text-white mt-1">
                ₦{successReceipt.amount.toLocaleString()} Airtime Sent
              </h2>
              <p className="text-xs text-body-color mt-1">
                Delivered to <strong className="text-dark dark:text-white">{successReceipt.phone}</strong> ({successReceipt.network})
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark text-xs text-body-color space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span>Order Ref:</span>
                <strong className="text-dark dark:text-white">{successReceipt.reference}</strong>
              </div>
              <div className="flex justify-between">
                <span>Remaining Wallet Balance:</span>
                <strong className="text-emerald-600">₦{successReceipt.newBalance.toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/orders"
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm"
              >
                View Order Receipt
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessReceipt(null);
                  setPhone("");
                }}
                className="px-6 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-dark transition"
              >
                Recharge Another Number
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
