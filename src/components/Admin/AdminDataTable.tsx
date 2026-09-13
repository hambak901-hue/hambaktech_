"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  RefreshCw,
  Inbox,
  Download,
} from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface FilterOption {
  key: string;
  label: string;
  options: Array<{ label: string; value: string }>;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: Array<keyof T | string>;
  filters?: FilterOption[];
  pageSize?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  actionButton?: React.ReactNode;
  exportFileName?: string;
  onExport?: () => void;
  rowKey?: (item: T, index: number) => string | number;
}

export default function AdminDataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  searchKeys = [],
  filters = [],
  pageSize = 10,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = "No records found",
  emptyDescription = "There are currently no items matching your criteria.",
  actionButton,
  exportFileName,
  onExport,
  rowKey,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) => {
        if (searchKeys.length > 0) {
          return searchKeys.some((k) => {
            const val = item[k as string];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
          });
        }
        // Fallback: search across all top-level primitive values
        return Object.values(item).some(
          (val) => typeof val === "string" || typeof val === "number"
            ? String(val).toLowerCase().includes(q)
            : false
        );
      });
    }

    // Active Dropdown Filters
    Object.entries(activeFilters).forEach(([key, filterVal]) => {
      if (filterVal && filterVal !== "ALL") {
        result = result.filter((item) => {
          const itemVal = item[key];
          return String(itemVal).toUpperCase() === filterVal.toUpperCase();
        });
      }
    });

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal === bVal) return 0;
        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, search, searchKeys, activeFilters, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleFilterChange = (filterKey: string, val: string) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: val }));
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-dark border border-stroke dark:border-strokedark rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Controls Header */}
      <div className="p-4 sm:p-5 border-b border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-dark/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-body-color" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white placeholder-body-color focus:border-primary focus:outline-none transition shadow-sm"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {filters.map((f) => (
            <div key={f.key} className="flex items-center gap-1.5">
              <select
                value={activeFilters[f.key] || "ALL"}
                onChange={(e) => handleFilterChange(f.key, e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-dark dark:text-white focus:border-primary focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="ALL">All {f.label}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-gray-dark text-dark dark:text-white transition shadow-sm"
              title="Export to CSV"
            >
              <Download className="w-3.5 h-3.5 text-body-color" />
              <span>Export</span>
            </button>
          )}

          {actionButton}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-900/40">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-dark dark:text-white mb-1">Failed to load records</h4>
          <p className="text-xs text-body-color max-w-sm mx-auto mb-4">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Query</span>
            </button>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-dark/70 text-[11px] font-bold uppercase tracking-wider text-body-color">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`py-3.5 px-4 ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1.5 font-bold hover:text-primary transition"
                    >
                      <span>{col.header}</span>
                      {sortKey === col.key ? (
                        sortOrder === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-primary" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5 text-body-color/50" />
                      )}
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stroke dark:divide-strokedark text-xs sm:text-sm">
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, r) => (
                <tr key={`skeleton-${r}`} className="animate-pulse">
                  {columns.map((col, c) => (
                    <td key={`scol-${c}`} className="py-4 px-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-dark text-body-color flex items-center justify-center mb-3">
                    <Inbox className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-dark dark:text-white mb-1">{emptyTitle}</h4>
                  <p className="text-xs text-body-color max-w-sm mx-auto">{emptyDescription}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const key = rowKey ? rowKey(item, idx) : item.id || idx;
                return (
                  <tr
                    key={key}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-dark/50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 text-dark dark:text-white ${
                          col.align === "right"
                            ? "text-right"
                            : col.align === "center"
                            ? "text-center"
                            : "text-left"
                        }`}
                      >
                        {col.render ? col.render(item, idx) : item[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && filteredData.length > 0 && (
        <div className="p-4 border-t border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-dark/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-body-color">
          <div>
            Showing{" "}
            <span className="font-bold text-dark dark:text-white">
              {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)}
            </span>{" "}
            to{" "}
            <span className="font-bold text-dark dark:text-white">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>{" "}
            of <span className="font-bold text-dark dark:text-white">{filteredData.length}</span>{" "}
            entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-white dark:hover:bg-dark disabled:opacity-40 disabled:pointer-events-none transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-dark dark:text-white bg-white dark:bg-dark rounded-lg border border-stroke dark:border-strokedark shadow-xs">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-stroke dark:border-strokedark hover:bg-white dark:hover:bg-dark disabled:opacity-40 disabled:pointer-events-none transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
