"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Plus,
  Minus,
  Trash2,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Receipt,
  FileText,
  MapPin,
  Phone,
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import platformApi from "@/lib/api-client";
import {
  ProductRecord,
  ProductCategoryRecord,
  DeliveryZoneRecord,
  Order,
} from "@/types/platform";

interface CartItem {
  product: ProductRecord;
  quantity: number;
}

export default function DashboardShopPage() {
  const [categories, setCategories] = useState<ProductCategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "BANK_TRANSFER" | "PAYSTACK" | "MONIEPOINT">("WALLET");
  const [orderNotes, setOrderNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"catalog" | "cart" | "orders">("catalog");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, prods, zones, ords] = await Promise.all([
        platformApi.fetchProductCategories(),
        platformApi.fetchProducts(),
        platformApi.fetchDeliveryZones(),
        platformApi.fetchShopOrders(),
      ]);

      setCategories(cats);
      setProducts(prods);
      setDeliveryZones(zones);
      setOrders(ords);

      if (zones.length > 0 && !selectedZoneId) {
        setSelectedZoneId(zones[0].id);
      }
    } catch (err: any) {
      console.error("Dashboard shop load error:", err);
      setFeedback({ type: "error", message: "Failed to load catalog and store details" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addToCart = (product: ProductRecord) => {
    if (product.stockQuantity <= 0) {
      setFeedback({ type: "error", message: `${product.name} is currently out of stock` });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setFeedback({ type: "error", message: `Cannot exceed available stock of ${product.stockQuantity} units` });
          setTimeout(() => setFeedback(null), 3000);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setFeedback({ type: "success", message: `Added ${product.name} to cart!` });
    setTimeout(() => setFeedback(null), 2500);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stockQuantity) {
              setFeedback({ type: "error", message: `Max available stock reached (${item.product.stockQuantity})` });
              setTimeout(() => setFeedback(null), 3000);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price ?? item.product.sellingPrice ?? 0) * item.quantity, 0);
  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0];
  const deliveryFee = selectedZone?.fee || 0;
  const totalAmount = subtotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      setSubmitting(true);
      const newOrder = await platformApi.createShopOrderRemote({
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryZoneId: selectedZoneId || deliveryZones[0]?.id,
        deliveryAddress: deliveryAddress || "Self-pickup at HambakTech Ibeju-Lekki Hub",
        paymentMethod,
        notes: orderNotes || undefined,
      });

      setFeedback({
        type: "success",
        message: `Order #${newOrder.orderNumber} confirmed! Our fulfillment team has received your request.`,
      });
      setCart([]);
      setActiveTab("orders");
      await loadData();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Checkout failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.categoryId === selectedCategory;
    const desc = p.description || p.shortDescription || p.fullDescription || "";
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <DashboardLayout
      pageTitle="Hardware & Stationery Shop Desk"
      breadcrumbs={[{ label: "Shop" }]}
    >
      <div className="space-y-6">
        {/* Alert Feedback */}
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

        {/* Top Shop Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-primary/80 text-white shadow-xl shadow-primary/15 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
                <span>HambakTech Verified Store</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">Computer Equipment & Office Supplies</h2>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                Order certified hardware, PVC plastic identity blanks, dual-band Wi-Fi routers, toners, and stationery with automatic dispatch and pickup.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("cart")}
                className="px-5 py-3 rounded-2xl bg-white text-primary font-bold text-xs hover:bg-white/90 transition shadow-sm flex items-center gap-2 shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
                {subtotal > 0 && <span className="font-mono">&bull; ₦{subtotal.toLocaleString()}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stroke dark:border-strokedark pb-2">
          {[
            { id: "catalog", label: "Product Catalog", icon: Package },
            {
              id: "cart",
              label: `Active Cart (${cart.reduce((sum, i) => sum + i.quantity, 0)})`,
              icon: ShoppingBag,
            },
            { id: "orders", label: `My Orders (${orders.length})`, icon: Receipt },
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

        {/* TAB 1: CATALOG */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            {/* Category Filter Pills & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                    selectedCategory === "all"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white dark:bg-dark border border-stroke dark:border-strokedark text-body-color hover:text-dark dark:hover:text-white"
                  }`}
                >
                  All ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                      selectedCategory === cat.id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white dark:bg-dark border border-stroke dark:border-strokedark text-body-color hover:text-dark dark:hover:text-white"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog..."
                  className="w-full px-3.5 py-2 pl-9 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-dark text-xs focus:outline-none focus:border-primary"
                />
                <Search className="w-3.5 h-3.5 text-body-color absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => {
                const inStock = prod.stockQuantity > 0;
                const inCart = cart.find((i) => i.product.id === prod.id);

                return (
                  <div
                    key={prod.id}
                    className="p-5 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
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
                          {inStock ? `${prod.stockQuantity} in Stock` : "Sold Out"}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-dark dark:text-white line-clamp-1">{prod.name}</h3>
                      <p className="text-xs text-body-color mt-1 line-clamp-2 leading-relaxed">{prod.description || prod.shortDescription || prod.fullDescription || "Standard specification."}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stroke dark:border-strokedark flex items-center justify-between">
                      <span className="text-sm font-black text-primary">₦{(prod.price ?? prod.sellingPrice ?? 0).toLocaleString()}</span>

                      <button
                        onClick={() => addToCart(prod)}
                        disabled={!inStock}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm ${
                          inStock
                            ? "bg-primary text-white hover:bg-primary/90"
                            : "bg-gray-200 dark:bg-gray-800 text-body-color cursor-not-allowed"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{inCart ? `Add (${inCart.quantity})` : "Add to Cart"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CART & CHECKOUT */}
        {activeTab === "cart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-4">
                <h3 className="text-base font-bold text-dark dark:text-white">Shopping Cart Review</h3>

                {cart.length > 0 ? (
                  <div className="divide-y divide-stroke/60 dark:divide-strokedark/60">
                    {cart.map((item) => (
                      <div key={item.product.id} className="py-4 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-dark dark:text-white">{item.product.name}</h4>
                          <span className="text-xs font-semibold text-primary font-mono block">
                            ₦{(item.product.price ?? item.product.sellingPrice ?? 0).toLocaleString()} each
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-stroke dark:border-strokedark rounded-xl overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="px-2.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-body-color"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold font-mono">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="px-2.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-body-color"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-dark dark:text-white font-mono w-20 text-right">
                            ₦{((item.product.price ?? item.product.sellingPrice ?? 0) * item.quantity).toLocaleString()}
                          </span>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <ShoppingBag className="w-12 h-12 text-body-color/40 mx-auto mb-2" />
                    <p className="text-xs text-body-color">Your cart is currently empty.</p>
                    <button
                      onClick={() => setActiveTab("catalog")}
                      className="mt-3 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition"
                    >
                      Browse Catalog
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Summary Card */}
            <div className="space-y-4">
              <form
                onSubmit={handleCheckout}
                className="p-6 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-4 text-xs"
              >
                <h3 className="text-base font-bold text-dark dark:text-white border-b border-stroke dark:border-strokedark pb-3">
                  Delivery & Settlement
                </h3>

                {/* Delivery Zone */}
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                    Delivery Zone / Pickup
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium focus:outline-none"
                  >
                    {deliveryZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} — {zone.fee === 0 ? "FREE" : `₦${zone.fee.toLocaleString()}`} ({zone.estimatedDeliveryTime || zone.estimatedDays})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                    Street Address / Delivery Note
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Suite 4, Lekki-Epe Express Way, or specify store pickup..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-900 text-dark dark:text-white font-medium focus:outline-none"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block font-bold text-dark dark:text-white uppercase mb-1">
                    Payment Channel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "WALLET", label: "Account Wallet" },
                      { id: "PAYSTACK", label: "Debit Card (Paystack)" },
                      { id: "MONIEPOINT", label: "Moniepoint POS/Transfer" },
                      { id: "BANK_TRANSFER", label: "Direct Bank Transfer" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2 rounded-xl border text-center font-bold transition ${
                          paymentMethod === m.id
                            ? "bg-primary text-white border-primary"
                            : "border-stroke dark:border-strokedark text-body-color"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div className="pt-3 border-t border-stroke dark:border-strokedark space-y-1.5">
                  <div className="flex justify-between text-body-color">
                    <span>Items Subtotal:</span>
                    <span className="font-mono font-bold text-dark dark:text-white">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-body-color">
                    <span>Delivery Fee ({selectedZone?.name}):</span>
                    <span className="font-mono font-bold text-dark dark:text-white">
                      {deliveryFee === 0 ? "FREE" : `₦${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-dark dark:text-white pt-2 border-t border-stroke dark:border-strokedark">
                    <span>Total Payable:</span>
                    <span className="text-primary font-mono text-base">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0 || submitting}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition ${
                    cart.length > 0 && !submitting
                      ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                      : "bg-gray-200 dark:bg-gray-800 text-body-color cursor-not-allowed"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{submitting ? "Placing Order..." : `Place Order (₦${totalAmount.toLocaleString()})`}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER HISTORY */}
        {activeTab === "orders" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-dark border border-stroke dark:border-strokedark shadow-sm space-y-4">
            <h3 className="text-base font-bold text-dark dark:text-white">Order History & Fulfillment Status</h3>

            {orders.length > 0 ? (
              <div className="divide-y divide-stroke/60 dark:divide-strokedark/60">
                {orders.map((order) => (
                  <div key={order.id} className="py-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="font-mono font-bold text-xs text-dark dark:text-white">
                          Order #{order.orderNumber}
                        </span>
                        <span className="text-xs text-body-color">
                          ({new Date(order.createdAt).toLocaleDateString()})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary font-mono">
                          ₦{order.totalAmount.toLocaleString()}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-body-color space-y-1">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {item.productName || item.name || "Item"} &times; {item.quantity}
                          </span>
                          <span className="font-mono">₦{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}</span>
                        </div>
                      ))}
                      {order.metadata?.deliveryZoneName && (
                        <div className="pt-1 text-[11px] text-body-color flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          <span>Delivery Zone: {order.metadata.deliveryZoneName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-body-color">
                No orders placed yet. Add items from the catalog and checkout above!
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
