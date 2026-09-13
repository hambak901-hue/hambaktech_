"use client";

import React, { useState } from "react";
import {
  Layers,
  Smartphone,
  Printer,
  Palette,
  Code,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  Edit,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDataTable, { Column } from "@/components/Admin/AdminDataTable";

interface ServiceCategoryRecord {
  id: string;
  name: string;
  code: string;
  description: string;
  activeOfferings: number;
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
}

const INITIAL_CATEGORIES: ServiceCategoryRecord[] = [
  {
    id: "cat-vtu",
    name: "Telecom VTU & Utility Payments",
    code: "VTU",
    description: "Airtime top-up, data bundles, electricity disco tokens, and cable TV subscriptions.",
    activeOfferings: 18,
    status: "ACTIVE",
    sortOrder: 1,
  },
  {
    id: "cat-biz",
    name: "Business Centre & Secretarial",
    code: "BUSINESS_CENTRE",
    description: "Photocopying, typesetting, high-res scanning, lamination, and spiral binding in Ibeju-Lekki.",
    activeOfferings: 8,
    status: "ACTIVE",
    sortOrder: 2,
  },
  {
    id: "cat-print",
    name: "Printing & PVC Card Production",
    code: "PRINTING",
    description: "Plastic NIN card prints, official staff ID cards, promotional flyers, banners, and brochures.",
    activeOfferings: 12,
    status: "ACTIVE",
    sortOrder: 3,
  },
  {
    id: "cat-graph",
    name: "Graphics & Visual Design",
    code: "GRAPHICS",
    description: "Brand identity, logos, event flyers, corporate profiles, and digital advertising collateral.",
    activeOfferings: 6,
    status: "ACTIVE",
    sortOrder: 4,
  },
  {
    id: "cat-web",
    name: "Web & Software Engineering",
    code: "SOFTWARE",
    description: "Responsive websites, custom portal development, database systems, and office IT automation.",
    activeOfferings: 5,
    status: "ACTIVE",
    sortOrder: 5,
  },
  {
    id: "cat-nin",
    name: "NIN Identity Operations",
    code: "NIN_ID",
    description: "NIN verification, premium slip reprints, data modification assistance, and PVC issuance.",
    activeOfferings: 4,
    status: "ACTIVE",
    sortOrder: 6,
  },
  {
    id: "cat-cac",
    name: "CAC Corporate Liaison",
    code: "CAC_REG",
    description: "Business name reservations, corporate registration, annual returns, and post-incorporation filing.",
    activeOfferings: 4,
    status: "ACTIVE",
    sortOrder: 7,
  },
  {
    id: "cat-acad",
    name: "Computer Training Academy",
    code: "ACADEMY",
    description: "Vocational computer literacy, desktop publishing, graphics, web design, and digital literacy.",
    activeOfferings: 7,
    status: "ACTIVE",
    sortOrder: 8,
  },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategoryRecord[]>(INITIAL_CATEGORIES);

  const handleToggleStatus = (catId: string) => {
    setCategories(
      categories.map((c) =>
        c.id === catId ? { ...c, status: c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : c
      )
    );
  };

  const columns: Column<ServiceCategoryRecord>[] = [
    {
      key: "name",
      header: "Category",
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-bold text-dark dark:text-white text-xs block">{c.name}</span>
          <span className="text-[11px] text-body-color">{c.description}</span>
        </div>
      ),
    },
    {
      key: "code",
      header: "System Code",
      render: (c) => <span className="font-mono text-xs text-primary font-bold">{c.code}</span>,
    },
    {
      key: "activeOfferings",
      header: "Active Services",
      sortable: true,
      align: "center",
      render: (c) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-dark dark:text-white">
          {c.activeOfferings} services
        </span>
      ),
    },
    {
      key: "sortOrder",
      header: "Display Order",
      sortable: true,
      align: "center",
      render: (c) => <span className="font-mono text-xs text-body-color">#{c.sortOrder}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (c) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
          c.status === "ACTIVE"
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${c.status === "ACTIVE" ? "bg-emerald-500" : "bg-gray-400"}`} />
          <span>{c.status}</span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(c.id)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-dark dark:text-white hover:bg-gray-200 transition"
        >
          {c.status === "ACTIVE" ? "Disable" : "Enable"}
        </button>
      ),
    },
  ];

  return (
    <AdminLayout
      pageTitle="Service Category Classifications"
      breadcrumbs={[{ label: "Service Categories" }]}
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Total Categories</span>
            <p className="text-xl font-bold text-dark dark:text-white mt-1">{categories.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Active Classifications</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {categories.filter((c) => c.status === "ACTIVE").length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-dark rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-xs text-body-color font-semibold block">Cumulative Offerings</span>
            <p className="text-xl font-bold text-primary mt-1">
              {categories.reduce((s, c) => s + c.activeOfferings, 0)} Total
            </p>
          </div>
        </div>

        {/* Categories Table */}
        <AdminDataTable
          columns={columns}
          data={categories}
          searchPlaceholder="Search category by name or code..."
          searchKeys={["name", "code", "description"]}
          emptyTitle="No categories found"
          emptyDescription="There are no categories matching your search query."
        />
      </div>
    </AdminLayout>
  );
}
