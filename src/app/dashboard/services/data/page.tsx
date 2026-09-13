"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";

interface DataPlan {
  id: string;
  name: string;
  size: string;
  validity: string;
  price: number;
}

const DATA_PLANS: Record<string, DataPlan[]> = {
  MTN: [
    { id: "mtn-500mb", name: "MTN SME Data", size: "500 MB", validity: "30 Days", price: 160 },
    { id: "mtn-1gb", name: "MTN SME Data", size: "1 GB", validity: "30 Days", price: 290 },
    { id: "mtn-2gb", name: "MTN SME Data", size: "2 GB", validity: "30 Days", price: 580 },
    { id: "mtn-3gb", name: "MTN SME Data", size: "3 GB", validity: "30 Days", price: 870 },
    { id: "mtn-5gb", name: "MTN SME Data", size: "5 GB", validity: "30 Days", price: 1450 },
    { id: "mtn-10gb", name: "MTN SME Data", size: "10 GB", validity: "30 Days", price: 2900 },
  ],
  AIRTEL: [
    { id: "airtel-1gb", name: "Airtel Corporate Gifting", size: "1 GB", validity: "30 Days", price: 300 },
    { id: "airtel-2gb", name: "Airtel Corporate Gifting", size: "2 GB", validity: "30 Days", price: 600 },
    { id: "airtel-5gb", name: "Airtel Corporate Gifting", size: "5 GB", validity: "30 Days", price: 1500 },
    { id: "airtel-10gb", name: "Airtel Corporate Gifting", size: "10 GB", validity: "30 Days", price: 3000 },
  ],
  GLO: [
    { id: "glo-1gb", name: "Glo Special Corporate", size: "1 GB", validity: "30 Days", price: 280 },
    { id: "glo-2gb", name: "Glo Special Corporate", size: "2 GB", validity: "30 Days", price: 560 },
    { id: "glo-5gb", name: "Glo Special Corporate", size: "5.8 GB", validity: "30 Days", price: 1400 },
  ],
  "9MOBILE": [
    { id: "9mobile-1gb", name: "9mobile SME Gifting", size: "1.5 GB", validity: "30 Days", price: 350 },
    { id: "9mobile-3gb", name: "9mobile SME Gifting", size: "3 GB", validity: "30 Days", price: 700 },
    { id: "9mobile-5gb", name: "9mobile SME Gifting", size: "5 GB", validity: "30 Days", price: 1200 },
  ],
};

export default function BuyDataPage() {
  const [network, setNetwork] = useState<string>("MTN");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("mtn-1gb");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(platformApi.getWallet());
  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    network: string;
    plan: string;
    phone: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  const plans = DATA_PLANS[network] || [];
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleNetworkChange = (net: string) => {
    setNetwork(net);
    const newPlans = DATA_PLANS[net] || [];
    if (newPlans.length > 0) {
      setSelectedPlanId(newPlans[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      alert("Please enter a valid 11-digit phone number");
      return;
    }
    if (!selectedPlan) return;

    if (wallet.currentBalance < selectedPlan.price) {
      alert("Insufficient wallet balance. Please fund your wallet to proceed.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const order = platformApi.purchaseData(network, phone, selectedPlan.id, selectedPlan.price);
        const updatedWallet = platformApi.getWallet();
        setWallet(updatedWallet);
        setLoading(false);
        setSuccessReceipt({
          reference: order.orderNumber,
          network,
          plan: `${selectedPlan.size} (${selectedPlan.name})`,
          phone,
          amount: selectedPlan.price,
          newBalance: updatedWallet.currentBalance,
        });
      } catch (err: any) {
        setLoading(false);
        alert(err.message || "Failed to process data bundle top-up");
      }
    }, 1000);
  };

  return (
    <DashboardLayout
      pageTitle="Instant Internet Data Top-up"
      breadcrumbs={[
        { label: "Services", href: "/dashboard/services" },
        { label: "Data" },
      ]}
    >
      <div className="max-w-xl mx-auto">
        {!successReceipt ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                    SME & Direct Data Bundles
                  </h2>
                  <p className="text-xs text-body-color">
                    Cheapest corporate rates with instant delivery
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
              {/* Network */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Select Network
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["MTN", "AIRTEL", "GLO", "9MOBILE"].map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => handleNetworkChange(net)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                        network === net
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-stroke dark:border-strokedark text-dark dark:text-white hover:border-primary"
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Plans */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Select Bundle Plan
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        selectedPlanId === plan.id
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value={plan.id}
                          checked={selectedPlanId === plan.id}
                          onChange={() => setSelectedPlanId(plan.id)}
                        />
                        <div>
                          <p className="text-xs font-bold text-dark dark:text-white">
                            {plan.size} — {plan.name}
                          </p>
                          <span className="text-[10px] text-body-color">Validity: {plan.validity}</span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-primary dark:text-primary">
                        ₦{plan.price.toLocaleString()}
                      </span>
                    </label>
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

              {/* Summary */}
              {selectedPlan && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark flex items-center justify-between text-xs">
                  <span className="text-body-color">Plan Selected ({selectedPlan.size}):</span>
                  <span className="font-extrabold text-dark dark:text-white text-sm">
                    ₦{selectedPlan.price.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !selectedPlan || !phone}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Activating Data Bundle...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay ₦{selectedPlan?.price.toLocaleString()}</span>
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
                Data Bundle Credited
              </span>
              <h2 className="text-2xl font-bold text-dark dark:text-white mt-1">
                {successReceipt.plan}
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
                <span>Amount Debited:</span>
                <strong className="text-dark dark:text-white">₦{successReceipt.amount.toLocaleString()}</strong>
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
                Send to Another Number
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
