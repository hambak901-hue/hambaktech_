"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Compass,
  Zap,
  Tv,
  ShieldCheck,
  Building2,
  GraduationCap,
  Printer,
  Search,
  ChevronRight,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { platformCategories, getServicesByCategory } from "@/data/platformCatalog";

export default function ServicesHubPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredCategories = selectedCategory === "ALL"
    ? platformCategories
    : platformCategories.filter((cat) => cat.id === selectedCategory);

  return (
    <DashboardLayout
      pageTitle="Digital Services Catalogue"
      breadcrumbs={[{ label: "Services" }]}
    >
      <div className="space-y-8">
        {/* Hub Header & Search */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
              Integrated Digital Offerings
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-white">
              Launch Any Service Instantly
            </h2>
            <p className="text-xs sm:text-sm text-body-color mt-1 leading-relaxed">
              Explore our complete suite of VTU utilities, identity verification desks, corporate CAC registrations, physical business centre tasks, and ICT academy certifications.
            </p>

            <div className="mt-5 relative">
              <Search className="w-4 h-4 text-body-color absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services (e.g. MTN Data, CAC Limited, NIN plastic card, Electricity)..."
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark text-dark dark:text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pt-5 mt-5 border-t border-stroke dark:border-strokedark">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === "ALL"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-dark text-body-color hover:text-dark dark:hover:text-white"
              }`}
            >
              All Categories
            </button>
            {platformCategories.filter((c) => c.id !== "ALL").map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-dark text-body-color hover:text-dark dark:hover:text-white"
                }`}
              >
                {cat.label || cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories and Items */}
        <div className="space-y-10">
          {filteredCategories.map((category) => {
            const allServices = getServicesByCategory(category.id);
            const services = allServices.filter((s) => {
              const nameText = (s.title || s.name || "").toLowerCase();
              const descText = (s.description || s.shortDesc || s.fullDesc || "").toLowerCase();
              const q = search.toLowerCase();
              return nameText.includes(q) || descText.includes(q);
            });

            if (services.length === 0) return null;

            return (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-dark dark:text-white flex items-center gap-2">
                      <span>{category.name || category.label}</span>
                    </h3>
                    <p className="text-xs text-body-color">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {services.map((item) => {
                    const itemTitle = item.title || item.name;
                    const itemDesc = item.description || item.shortDesc || item.fullDesc;
                    const itemPrice = item.price || item.startingPrice || "Instant Access";
                    const turnaround = item.estimatedTurnaround || (item.status === "AVAILABLE" ? "Instant / Same Day" : "On Request");

                    let targetUrl = "/dashboard/orders";
                    if (item.id.includes("airtime")) {
                      targetUrl = "/dashboard/services/airtime";
                    } else if (item.id.includes("data")) {
                      targetUrl = "/dashboard/services/data";
                    } else if (item.id.includes("electricity") || item.id.includes("power")) {
                      targetUrl = "/dashboard/services/electricity";
                    } else if (item.id.includes("cable") || item.id.includes("tv")) {
                      targetUrl = "/dashboard/services/cable-tv";
                    } else if (item.id.includes("nin") || item.group === "DIGITAL_PORTALS" && item.id.includes("identity")) {
                      targetUrl = "/dashboard/nin";
                    } else if (item.id.includes("cac") || item.id.includes("business-registration")) {
                      targetUrl = "/dashboard/cac";
                    } else if (item.group === "ACADEMY_TRAINING" || item.id.includes("academy") || item.id.includes("training")) {
                      targetUrl = "/dashboard/academy";
                    }

                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark hover:border-primary/60 transition shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="text-sm font-bold text-dark dark:text-white leading-snug">
                              {itemTitle}
                            </h4>
                            <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg shrink-0">
                              {typeof itemPrice === "number" ? `₦${itemPrice.toLocaleString()}` : itemPrice}
                            </span>
                          </div>

                          <p className="text-xs text-body-color line-clamp-2 leading-relaxed">
                            {itemDesc}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-stroke/60 dark:border-strokedark/60 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[11px] text-body-color">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{turnaround}</span>
                          </span>

                          <Link
                            href={targetUrl}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition"
                          >
                            <span>Order Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
