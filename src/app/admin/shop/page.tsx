"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Layers,
  History,
  Tag,
  Eye,
  X,
  FileText,
  Boxes,
  Send,
} from "lucide-react";
import AdminLayout from "@/components/Admin/AdminLayout";
import platformApi from "@/lib/api-client";
import {
  ProductRecord,
  ProductCategoryRecord,
  InventoryLogRecord,
  DeliveryZoneRecord,
  Order,
} from "@/types/platform";

export default function AdminShopPage() {
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "inventory" | "orders">("products");

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<ProductCategoryRecord[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    categoryId: "",
    price: 5000,
    costPrice: 3500,
    stockQuantity: 20,
    minStockLevel: 5,
    description: "",
    brand: "HambakTech Verified",
    warrantyPeriod: "1 Year",
  });

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    productId: "",
    type: "RESTOCK" as "RESTOCK" | "DAMAGE" | "AUDIT" | "RETURN",
    quantity: 10,
    note: "Batch replenishment from central warehouse",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats, logs, ords, zones] = await Promise.all([
        platformApi.fetchProducts(),
        platformApi.fetchProductCategories(),
        platformApi.fetchInventoryLogs(),
        platformApi.fetchShopOrders(),
        platformApi.fetchDeliveryZones(),
      ]);

      setProducts(prods);
      setCategories(cats);
      setInventoryLogs(logs);
      setOrders(ords);
      setDeliveryZones(zones);

      if (cats.length > 0 && !productForm.categoryId) {
        setProductForm((prev) => ({ ...prev, categoryId: cats[0].id }));
      }
      if (prods.length > 0 && !adjustForm.productId) {
        setAdjustForm((prev) => ({ ...prev, productId: prods[0].id }));
      }
    } catch (err: any) {
      console.error("Admin shop load error:", err);
      setFeedback({ type: "error", message: "Failed to load shop administrative data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save new product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/shop/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to add product");

      setFeedback({ type: "success", message: `Product ${json.data.name} added to inventory!` });
      setShowProductModal(false);
      setProductForm({
        name: "",
        sku: "",
        categoryId: categories[0]?.id || "",
        price: 5000,
        costPrice: 3500,
        stockQuantity: 20,
        minStockLevel: 5,
        description: "",
        brand: "HambakTech Verified",
        warrantyPeriod: "1 Year",
      });
      await loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  // Adjust Stock
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await platformApi.adjustStockRemote({
        productId: adjustForm.productId,
        type: adjustForm.type,
        quantity: Number(adjustForm.quantity),
        note: adjustForm.note,
      });

      setFeedback({ type: "success", message: "Stock adjustment committed to ledger!" });
      setShowAdjustModal(false);
      await loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update order status");

      setFeedback({ type: "success", message: `Order updated to ${nextStatus}` });
      await loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  return (
    <AdminLayout
      pageTitle="Shop & Inventory Administration Desk"
      breadcrumbs={[{ label: "Operations" }, { label: "Shop" }]}
      actionButton={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-dark border border-stroke dark:border-strokedark text-dark dark:text-white font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-1.5"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
            <span>Adjust Stock</span>
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-xs opacity-75 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">Products in Catalog</span>
            <span className="text-xl font-bold text-dark dark:text-white mt-1 block">{products.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">Product Categories</span>
            <span className="text-xl font-bold text-dark dark:text-white mt-1 block">{categories.length}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">Pending Orders</span>
            <span className="text-xl font-bold text-amber-600 mt-1 block">
              {orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm">
            <span className="text-[11px] font-bold text-body-color uppercase block">Inventory Audit Logs</span>
            <span className="text-xl font-bold text-dark dark:text-white mt-1 block">{inventoryLogs.length}</span>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stroke dark:border-strokedark pb-2">
          {[
            { id: "products", label: "Catalog & Stock", icon: Package },
            { id: "categories", label: "Categories", icon: Layers },
            { id: "inventory", label: "Inventory Audit Logs", icon: History },
            { id: "orders", label: `Fulfillment Orders (${orders.length})`, icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                  isCurrent
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white dark:bg-dark text-body-color hover:text-dark dark:hover:text-white border border-stroke dark:border-strokedark"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PRODUCTS & STOCK */}
        {activeTab === "products" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Product Inventory & SKU Pricing</h3>
                <p className="text-xs text-body-color">Manage stock levels, minimum alerts, wholesale cost, and retail price.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark text-body-color uppercase font-bold text-[11px]">
                    <th className="pb-3">Product Name & Brand</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Retail Price</th>
                    <th className="pb-3">Cost Price</th>
                    <th className="pb-3">Stock Qty</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke/60 dark:divide-strokedark/60">
                  {products.map((prod) => {
                    const isLowStock = prod.stockQuantity <= prod.minStockLevel;

                    return (
                      <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                        <td className="py-3.5">
                          <span className="font-bold text-dark dark:text-white block">{prod.name}</span>
                          <span className="text-[11px] text-body-color">{prod.brand} &bull; {prod.warrantyPeriod} Warranty</span>
                        </td>
                        <td className="py-3.5 font-mono text-[11px] font-semibold">{prod.sku}</td>
                        <td className="py-3.5 font-bold text-primary font-mono">₦{prod.price.toLocaleString()}</td>
                        <td className="py-3.5 font-mono text-body-color">₦{prod.costPrice.toLocaleString()}</td>
                        <td className="py-3.5">
                          <span className="font-mono font-bold text-dark dark:text-white">{prod.stockQuantity} units</span>
                          {isLowStock && (
                            <span className="block text-[10px] text-amber-600 font-bold">Min: {prod.minStockLevel}</span>
                          )}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.stockQuantity > 0
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            {prod.stockQuantity > 0 ? "Active In Stock" : "Out of Stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-dark dark:text-white">Product Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-900/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-dark dark:text-white">{cat.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {cat.slug}
                    </span>
                  </div>
                  <p className="text-xs text-body-color">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY AUDIT LOGS */}
        {activeTab === "inventory" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-dark dark:text-white">Inventory Stock Movement Ledger</h3>
                <p className="text-xs text-body-color">Immutable history of Restocks, Sales, Damages, and Returns.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark text-body-color uppercase font-bold text-[11px]">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Movement Type</th>
                    <th className="pb-3">Qty Change</th>
                    <th className="pb-3">Previous / New</th>
                    <th className="pb-3">Reason / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke/60 dark:divide-strokedark/60 font-medium">
                  {inventoryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                      <td className="py-3.5 text-body-color">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 font-bold text-dark dark:text-white">{log.productName}</td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.type === "RESTOCK"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : log.type === "SALE"
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono font-bold">
                        {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                      </td>
                      <td className="py-3.5 font-mono text-body-color">
                        {log.previousQuantity} &rarr; {log.newQuantity}
                      </td>
                      <td className="py-3.5 text-body-color">{log.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS & DISPATCH FULFILLMENT */}
        {activeTab === "orders" && (
          <div className="bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-dark dark:text-white">Customer Orders & Dispatch Desk</h3>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-stroke dark:border-strokedark bg-gray-50/50 dark:bg-gray-900/30 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-sm text-dark dark:text-white">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-xs text-body-color">
                        ({new Date(order.createdAt).toLocaleString()})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary font-mono">
                        ₦{order.totalAmount.toLocaleString()}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-dark text-xs font-bold text-dark dark:text-white"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stroke dark:border-strokedark text-xs text-body-color space-y-1">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.productName || item.name || "Item"} &times; {item.quantity}
                        </span>
                        <span className="font-mono">₦{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-1 text-[11px] text-body-color flex items-center gap-1">
                      <span>Delivery Note / Address: {order.metadata?.deliveryAddress || "Store Pickup"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Add Product */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <h4 className="text-base font-bold text-dark dark:text-white">Add Product to Inventory</h4>
                <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Wireless Barcode Scanner"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="e.g. HT-SCN-001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Category</label>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">Retail Price (₦)</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Cost Price (₦)</label>
                    <input
                      type="number"
                      required
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">Initial Stock Qty</label>
                    <input
                      type="number"
                      required
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Min Stock Alert</label>
                    <input
                      type="number"
                      required
                      value={productForm.minStockLevel}
                      onChange={(e) => setProductForm({ ...productForm, minStockLevel: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 rounded-xl border border-stroke font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition">
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Adjust Stock */}
        {showAdjustModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-dark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-stroke dark:border-strokedark pb-3">
                <h4 className="text-base font-bold text-dark dark:text-white">Stock Adjustment & Audit</h4>
                <button onClick={() => setShowAdjustModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
              </div>

              <form onSubmit={handleSaveAdjustment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">Select Product</label>
                  <select
                    value={adjustForm.productId}
                    onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current: {p.stockQuantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase mb-1">Adjustment Type</label>
                    <select
                      value={adjustForm.type}
                      onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    >
                      <option value="RESTOCK">RESTOCK (+)</option>
                      <option value="AUDIT">AUDIT (=)</option>
                      <option value="DAMAGE">DAMAGE (-)</option>
                      <option value="RETURN">RETURN (+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      value={adjustForm.quantity}
                      onChange={(e) => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Audit Ledger Reason / Note</label>
                  <textarea
                    rows={2}
                    required
                    value={adjustForm.note}
                    onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stroke dark:border-strokedark">
                  <button type="button" onClick={() => setShowAdjustModal(false)} className="px-4 py-2 rounded-xl border border-stroke font-semibold">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition">
                    Commit Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
