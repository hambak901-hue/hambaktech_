"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Percent,
  Save,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Building2,
  Tv,
  GraduationCap,
  CreditCard,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function AdminPricingPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Pricing State
  const [pricing, setPricing] = useState({
    airtimeDiscountPct: 2.0,
    dataMarginPct: 5.0,
    electricityConvenienceFee: 100,
    cableTvConvenienceFee: 100,
    ninPlasticCardPrice: 2500,
    ninSlipReprintPrice: 1500,
    ninModificationConsultPrice: 3000,
    cacBusinessNamePrice: 22000,
    cacLimitedCompanyPrice: 55000,
    cacNgoPrice: 110000,
    academyCompLiteracy: 35000,
    academyGraphicDesign: 45000,
    academyWebDev: 60000,
    academyDataAnalysis: 50000,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 600);
  };

  return (
    <DashboardLayout
      pageTitle="Dynamic Pricing & Profit Margin Engine"
      breadcrumbs={[
        { label: "Admin Console", href: "/admin" },
        { label: "Pricing Engine" },
      ]}
    >
      <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
              <Sliders className="w-4 h-4" />
              <span>Real-Time Pricing Governance</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              Fee Structure & Profit Margins
            </h2>
            <p className="text-xs text-body-color mt-0.5">
              Set customer retail prices, merchant discounts, and operational surcharges across all HambakTech services.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-primary/25 flex items-center gap-2 shrink-0"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing Rates...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>
              Pricing configuration successfully saved and synchronized across the platform!
            </span>
          </div>
        )}

        {/* Section 1: VTU & Bills */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-dark dark:text-white">
              VTU & Utilities Commission Margins
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Airtime Customer Cashback / Discount (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={pricing.airtimeDiscountPct}
                  onChange={(e) =>
                    setPricing({ ...pricing, airtimeDiscountPct: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
                />
                <Percent className="w-4 h-4 text-body-color absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Data Bundle Wholesale Margin (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={pricing.dataMarginPct}
                  onChange={(e) =>
                    setPricing({ ...pricing, dataMarginPct: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
                />
                <Percent className="w-4 h-4 text-body-color absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Electricity Meter Convenience Surcharge (₦)
              </label>
              <input
                type="number"
                value={pricing.electricityConvenienceFee}
                onChange={(e) =>
                  setPricing({ ...pricing, electricityConvenienceFee: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Cable TV Decoder Surcharge (₦)
              </label>
              <input
                type="number"
                value={pricing.cableTvConvenienceFee}
                onChange={(e) =>
                  setPricing({ ...pricing, cableTvConvenienceFee: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: NIN Desk Rates */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-dark dark:text-white">
              NIN Centre Service Fees
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Plastic PVC Card (₦)
              </label>
              <input
                type="number"
                value={pricing.ninPlasticCardPrice}
                onChange={(e) =>
                  setPricing({ ...pricing, ninPlasticCardPrice: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Slip Retrieval & Reprint (₦)
              </label>
              <input
                type="number"
                value={pricing.ninSlipReprintPrice}
                onChange={(e) =>
                  setPricing({ ...pricing, ninSlipReprintPrice: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Data Modification Guidance (₦)
              </label>
              <input
                type="number"
                value={pricing.ninModificationConsultPrice}
                onChange={(e) =>
                  setPricing({
                    ...pricing,
                    ninModificationConsultPrice: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: CAC Filing Rates */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-dark dark:text-white">
              CAC Corporate Registration Fees (Inclusive of Official Commission Fees)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Business Name (BN) Fee (₦)
              </label>
              <input
                type="number"
                value={pricing.cacBusinessNamePrice}
                onChange={(e) =>
                  setPricing({ ...pricing, cacBusinessNamePrice: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Private Limited (LTD) Fee (₦)
              </label>
              <input
                type="number"
                value={pricing.cacLimitedCompanyPrice}
                onChange={(e) =>
                  setPricing({ ...pricing, cacLimitedCompanyPrice: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                NGO / Trustees (IT) Fee (₦)
              </label>
              <input
                type="number"
                value={pricing.cacNgoPrice}
                onChange={(e) =>
                  setPricing({ ...pricing, cacNgoPrice: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Academy Tuitions */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-dark dark:text-white">
              Academy Course Tuitions
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Computer Literacy (₦)
              </label>
              <input
                type="number"
                value={pricing.academyCompLiteracy}
                onChange={(e) =>
                  setPricing({ ...pricing, academyCompLiteracy: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Graphic Design (₦)
              </label>
              <input
                type="number"
                value={pricing.academyGraphicDesign}
                onChange={(e) =>
                  setPricing({ ...pricing, academyGraphicDesign: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Web Development (₦)
              </label>
              <input
                type="number"
                value={pricing.academyWebDev}
                onChange={(e) =>
                  setPricing({ ...pricing, academyWebDev: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-dark dark:text-white uppercase tracking-wider mb-1">
                Data Analysis (₦)
              </label>
              <input
                type="number"
                value={pricing.academyDataAnalysis}
                onChange={(e) =>
                  setPricing({ ...pricing, academyDataAnalysis: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white font-bold"
              />
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
