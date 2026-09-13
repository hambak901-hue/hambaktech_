"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Tv,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";

interface Bouquet {
  id: string;
  name: string;
  price: number;
}

const CABLE_PACKAGES: Record<string, Bouquet[]> = {
  GOTV: [
    { id: "gotv-smallie", name: "GOtv Smallie", price: 1575 },
    { id: "gotv-jinja", name: "GOtv Jinja", price: 3300 },
    { id: "gotv-jolli", name: "GOtv Jolli", price: 4850 },
    { id: "gotv-max", name: "GOtv Max", price: 7200 },
    { id: "gotv-supa", name: "GOtv Supa", price: 9600 },
    { id: "gotv-supaplus", name: "GOtv Supa+", price: 15700 },
  ],
  DSTV: [
    { id: "dstv-padi", name: "DStv Padi", price: 4400 },
    { id: "dstv-yanga", name: "DStv Yanga", price: 6000 },
    { id: "dstv-confam", name: "DStv Confam", price: 11000 },
    { id: "dstv-compact", name: "DStv Compact", price: 19000 },
    { id: "dstv-compactplus", name: "DStv Compact Plus", price: 30000 },
    { id: "dstv-premium", name: "DStv Premium", price: 44500 },
  ],
  STARTIMES: [
    { id: "star-nova", name: "StarTimes Nova", price: 1700 },
    { id: "star-basic", name: "StarTimes Basic", price: 3300 },
    { id: "star-smart", name: "StarTimes Smart", price: 4200 },
    { id: "star-classic", name: "StarTimes Classic", price: 5000 },
    { id: "star-super", name: "StarTimes Super", price: 8200 },
  ],
};

export default function PayCableTVPage() {
  const [provider, setProvider] = useState<"GOTV" | "DSTV" | "STARTIMES">("GOTV");
  const [iucNumber, setIucNumber] = useState("");
  const [verifiedCustomer, setVerifiedCustomer] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedBouquetId, setSelectedBouquetId] = useState("gotv-jolli");
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(platformApi.getWallet());

  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    provider: string;
    iucNumber: string;
    bouquet: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  const currentBouquets = CABLE_PACKAGES[provider] || [];
  const selectedBouquet = currentBouquets.find((b) => b.id === selectedBouquetId) || currentBouquets[0];

  const handleProviderChange = (prov: "GOTV" | "DSTV" | "STARTIMES") => {
    setProvider(prov);
    setVerifiedCustomer(null);
    const bouquets = CABLE_PACKAGES[prov] || [];
    if (bouquets.length > 0) {
      setSelectedBouquetId(bouquets[0].id);
    }
  };

  const handleVerifyIUC = () => {
    if (!iucNumber || iucNumber.length < 9) {
      alert("Please enter a valid Smartcard / IUC number of at least 9 digits");
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerifiedCustomer("MRS. CHIDINMA OBI — ACCOUNT ACTIVE");
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iucNumber) {
      alert("Please enter your Smartcard or IUC number");
      return;
    }
    if (!selectedBouquet) return;

    if (wallet.currentBalance < selectedBouquet.price) {
      alert("Insufficient wallet balance. Please fund your wallet to proceed.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const order = platformApi.purchaseCableTV(provider, iucNumber, selectedBouquet.name, selectedBouquet.price);
        const updatedWallet = platformApi.getWallet();
        setWallet(updatedWallet);
        setLoading(false);
        setSuccessReceipt({
          reference: order.orderNumber,
          provider,
          iucNumber,
          bouquet: selectedBouquet.name,
          amount: selectedBouquet.price,
          newBalance: updatedWallet.currentBalance,
        });
      } catch (err: any) {
        setLoading(false);
        alert(err.message || "Failed to renew cable TV subscription");
      }
    }, 1200);
  };

  return (
    <DashboardLayout
      pageTitle="Cable TV Decoder Subscription Renewal"
      breadcrumbs={[
        { label: "Services", href: "/dashboard/services" },
        { label: "Cable TV" },
      ]}
    >
      <div className="max-w-xl mx-auto">
        {!successReceipt ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-dark dark:text-white">
                    Cable TV Renewal
                  </h2>
                  <p className="text-xs text-body-color">
                    Instant reconnection for GOtv, DStv, & StarTimes
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
              {/* Provider */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Select Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["GOTV", "DSTV", "STARTIMES"] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => handleProviderChange(prov)}
                      className={`py-2.5 rounded-xl border text-center font-bold text-xs transition ${
                        provider === prov
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-stroke dark:border-strokedark text-dark dark:text-white hover:border-primary"
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              {/* IUC / Smartcard Number */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-1.5">
                  Smartcard / IUC Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={iucNumber}
                    onChange={(e) => {
                      setIucNumber(e.target.value.replace(/[^0-9]/g, ""));
                      setVerifiedCustomer(null);
                    }}
                    placeholder="Enter 10 or 11-digit IUC number"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white text-sm focus:outline-none focus:border-primary font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyIUC}
                    disabled={verifying || !iucNumber}
                    className="px-4 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white font-bold text-xs transition shrink-0 disabled:opacity-50"
                  >
                    {verifying ? "Checking..." : "Verify"}
                  </button>
                </div>

                {verifiedCustomer && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Customer: <strong>{verifiedCustomer}</strong></span>
                  </div>
                )}
              </div>

              {/* Bouquets */}
              <div>
                <label className="block text-xs font-bold text-dark dark:text-white uppercase tracking-wider mb-2">
                  Select Package / Bouquet
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {currentBouquets.map((b) => (
                    <label
                      key={b.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        selectedBouquetId === b.id
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-dark"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="bouquet"
                          value={b.id}
                          checked={selectedBouquetId === b.id}
                          onChange={() => setSelectedBouquetId(b.id)}
                        />
                        <span className="text-xs font-bold text-dark dark:text-white">
                          {b.name}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-primary dark:text-primary">
                        ₦{b.price.toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedBouquet && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-dark border border-stroke dark:border-strokedark flex items-center justify-between text-xs">
                  <span className="text-body-color">Package Total:</span>
                  <span className="font-extrabold text-dark dark:text-white text-sm">
                    ₦{selectedBouquet.price.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !selectedBouquet || !iucNumber}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/25 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to MultiChoice / StarTimes Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Activate Subscription (₦{selectedBouquet?.price.toLocaleString()})</span>
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
                Decoder Renewed Successfully
              </span>
              <h2 className="text-2xl font-bold text-dark dark:text-white mt-1">
                {successReceipt.bouquet} Activated
              </h2>
              <p className="text-xs text-body-color mt-1">
                IUC: <strong className="text-dark dark:text-white">{successReceipt.iucNumber}</strong> ({successReceipt.provider})
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-dark text-xs text-body-color space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span>Order Ref:</span>
                <strong className="text-dark dark:text-white">{successReceipt.reference}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
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
                View Order Receipt
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessReceipt(null);
                  setIucNumber("");
                }}
                className="px-6 py-2.5 rounded-xl border border-stroke dark:border-strokedark text-dark dark:text-white font-semibold text-xs hover:bg-gray-50 dark:hover:bg-gray-dark transition"
              >
                Renew Another Decoder
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
