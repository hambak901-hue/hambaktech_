"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Filter,
  Package,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  Star,
  Plus,
} from "lucide-react";
import platformApi from "@/lib/api-client";
import { ProductRecord, ProductCategoryRecord } from "@/types/platform";

export default function ShopPublicPage() {
  const [categories, setCategories] = useState<ProductCategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          platformApi.fetchProductCategories(),
          platformApi.fetchProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error("Failed to load shop storefront data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pt-28 pb-20 bg-gray-50 dark:bg-black text-dark dark:text-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-body-color">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-dark dark:text-white font-medium">HambakTech Shop</span>
        </div>

        {/* Hero Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0A1D37] via-[#0E2A47] to-[#0A1D37] text-white mb-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Official Hardware, Computer Accessories & Stationery Store</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Genuine IT Equipment & Office Supplies
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-white/80 leading-relaxed">
              Serving Ibeju-Lekki and nationwide with tested brand laptops, dual-band routers, premium plastic PVC card stock, high-yield toners, and certified office electronics.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard/shop"
                className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/25 inline-flex items-center gap-2"
              >
                <span>Customer Order Desk & Cart</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#catalog"
                className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition inline-flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Browse Products ({products.length})</span>
              </a>
            </div>
          </div>
        </div>

        {/* Key Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark dark:text-white">100% Genuine Hardware</h3>
              <p className="text-xs text-body-color mt-0.5">Direct from authorized OEM distributors with warranty.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark dark:text-white">Express Delivery</h3>
              <p className="text-xs text-body-color mt-0.5">Same-day pickup in Ibeju-Lekki & Lagos dispatch.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark dark:text-white">Flexible Settlement</h3>
              <p className="text-xs text-body-color mt-0.5">Pay seamlessly with your account wallet, card, or transfer.</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div id="catalog" className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                selectedCategory === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white dark:bg-dark border border-stroke dark:border-strokedark text-body-color hover:text-dark dark:hover:text-white"
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white dark:bg-dark border border-stroke dark:border-strokedark text-body-color hover:text-dark dark:hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, brand, or SKU..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-xs focus:outline-none focus:border-primary"
            />
            <Search className="w-4 h-4 text-body-color absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-body-color">Loading shop catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const inStock = prod.stockQuantity > 0;

              return (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm flex flex-col justify-between hover:border-primary/50 transition group"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-body-color">
                        {prod.sku}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          inStock
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {inStock ? `${prod.stockQuantity} in Stock` : "Out of Stock"}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-dark dark:text-white group-hover:text-primary transition line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-body-color mt-1 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Specs Pills */}
                    {prod.specifications && Object.keys(prod.specifications).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {Object.entries(prod.specifications).slice(0, 3).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-stroke dark:border-strokedark text-[10px] text-body-color"
                          >
                            <strong className="text-dark dark:text-white">{k}:</strong> {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-stroke/60 dark:border-strokedark/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-body-color block uppercase font-semibold">Price</span>
                      <span className="text-base font-extrabold text-primary">
                        ₦{prod.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/shop?product=${prod.id}`}
                      className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition shadow-sm flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order Now</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark">
            <Package className="w-12 h-12 text-body-color/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-dark dark:text-white">No items found</h3>
            <p className="text-xs text-body-color mt-1">Try clearing your search query or selecting another category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
