"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Smartphone,
  Server,
  Shield,
  CreditCard,
  BookOpen,
  ShoppingBag,
  Bell,
  Code2,
  CheckCircle2,
  Terminal,
  Play,
  Copy,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface EndpointDoc {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  category: "Auth" | "Wallet" | "Orders" | "Payments" | "Services" | "Academy" | "Shop" | "Notifications" | "System";
  title: string;
  description: string;
  authRequired: boolean;
  sampleBody?: any;
  sampleQuery?: string;
  responsePreview?: any;
}

const ENDPOINTS: EndpointDoc[] = [
  // Auth
  {
    id: "auth-login",
    method: "POST",
    path: "/api/v1/auth/login",
    category: "Auth",
    title: "User Login",
    description: "Authenticates customer/student credentials and returns a Bearer session token.",
    authRequired: false,
    sampleBody: {
      identifier: "customer@hambaktech.com.ng",
      password: "Password123!",
      rememberMe: true,
    },
  },
  {
    id: "auth-register",
    method: "POST",
    path: "/api/v1/auth/register",
    category: "Auth",
    title: "User Registration",
    description: "Registers a new customer account and creates their initial authoritative wallet.",
    authRequired: false,
    sampleBody: {
      firstName: "Chinedu",
      lastName: "Okafor",
      email: "chinedu@example.com",
      phone: "+2348012345678",
      password: "SecurePassword123!",
    },
  },
  {
    id: "auth-me",
    method: "GET",
    path: "/api/v1/auth/me",
    category: "Auth",
    title: "Current User Profile & Balance",
    description: "Returns the authenticated user details, permissions, and real-time wallet balance.",
    authRequired: true,
  },
  {
    id: "auth-refresh",
    method: "POST",
    path: "/api/v1/auth/refresh",
    category: "Auth",
    title: "Refresh Session Token",
    description: "Refreshes and extends active session duration for mobile apps.",
    authRequired: true,
  },
  // Wallet
  {
    id: "wallet-get",
    method: "GET",
    path: "/api/v1/wallet",
    category: "Wallet",
    title: "Wallet Status & Balances",
    description: "Retrieves authoritative current, ledger, and locked balances.",
    authRequired: true,
  },
  {
    id: "wallet-tx",
    method: "GET",
    path: "/api/v1/wallet/transactions",
    category: "Wallet",
    title: "Transaction History",
    description: "Paginated list of user's financial transactions and audit entries.",
    authRequired: true,
    sampleQuery: "?page=1&limit=10",
  },
  {
    id: "wallet-fund",
    method: "POST",
    path: "/api/v1/wallet/fund",
    category: "Wallet",
    title: "Fund Wallet",
    description: "Server-authoritative wallet crediting via Paystack, Flutterwave, or Moniepoint.",
    authRequired: true,
    sampleBody: {
      amount: 5000,
      paymentMethod: "PAYSTACK",
      description: "Mobile Top-up",
    },
  },
  // Orders
  {
    id: "orders-list",
    method: "GET",
    path: "/api/v1/orders",
    category: "Orders",
    title: "List Orders",
    description: "Retrieves the authenticated user's digital service orders.",
    authRequired: true,
  },
  {
    id: "orders-create",
    method: "POST",
    path: "/api/v1/orders",
    category: "Orders",
    title: "Create Service Order",
    description: "Places a digital service order with server-calculated pricing.",
    authRequired: true,
    sampleBody: {
      serviceTitle: "NIN Modification & Correction",
      serviceCategorySlug: "identity-verification",
      paymentMethod: "WALLET",
      items: [{ title: "Name & DOB Correction", quantity: 1, unitPrice: 3500 }],
      notes: "Urgent processing requested",
    },
  },
  // Payments
  {
    id: "payments-gateways",
    method: "GET",
    path: "/api/v1/payments/gateways",
    category: "Payments",
    title: "Active Payment Gateways",
    description: "Returns currently enabled payment gateways (Paystack, Flutterwave, Moniepoint, etc.).",
    authRequired: false,
  },
  {
    id: "payments-init",
    method: "POST",
    path: "/api/v1/payments/initialize",
    category: "Payments",
    title: "Initialize Payment",
    description: "Generates an authoritative payment checkout reference.",
    authRequired: true,
    sampleBody: {
      amount: 5000,
      gateway: "PAYSTACK",
      purpose: "WALLET_FUNDING",
    },
  },
  // Services
  {
    id: "services-list",
    method: "GET",
    path: "/api/v1/services",
    category: "Services",
    title: "Services Catalog",
    description: "Fetches active digital, identity, VTU, and ICT platform services.",
    authRequired: false,
  },
  {
    id: "services-calc",
    method: "POST",
    path: "/api/v1/services/calculate-price",
    category: "Services",
    title: "Calculate Price Authoritatively",
    description: "Calculates unit price, customer-tier discounts, and platform fees on the server.",
    authRequired: false,
    sampleBody: {
      serviceId: "nin-enrollment",
      customerTier: "STANDARD",
      quantity: 1,
    },
  },
  // Academy
  {
    id: "academy-courses",
    method: "GET",
    path: "/api/v1/academy/courses",
    category: "Academy",
    title: "Course Catalog",
    description: "Fetches ICT diploma, coding, graphics, and vocational courses.",
    authRequired: false,
  },
  {
    id: "academy-enroll",
    method: "POST",
    path: "/api/v1/academy/enroll",
    category: "Academy",
    title: "Enroll Student",
    description: "Enrolls student and authoritatively debits tuition fee from wallet.",
    authRequired: true,
    sampleBody: {
      courseId: "crs-fullstack-dev",
      cohort: "Morning Batch (Mon-Wed)",
      payWithWallet: true,
    },
  },
  {
    id: "academy-idcards",
    method: "GET",
    path: "/api/v1/academy/id-cards",
    category: "Academy",
    title: "Student Digital ID Cards",
    description: "Returns verified digital student ID cards with QR codes.",
    authRequired: true,
  },
  // Shop
  {
    id: "shop-products",
    method: "GET",
    path: "/api/v1/shop/products",
    category: "Shop",
    title: "Shop Products Catalog",
    description: "Search and filter computers, hardware accessories, and consumables.",
    authRequired: false,
  },
  {
    id: "shop-order",
    method: "POST",
    path: "/api/v1/shop/orders",
    category: "Shop",
    title: "Place Shop Order",
    description: "Validates stock levels and places hardware order with delivery fee calculation.",
    authRequired: true,
    sampleBody: {
      items: [{ productId: "prod-laptop-01", quantity: 1 }],
      deliveryZoneId: "zone-lagos-island",
      deliveryAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",
      paymentMethod: "WALLET",
    },
  },
  // System
  {
    id: "system-config",
    method: "GET",
    path: "/api/v1/system/config",
    category: "System",
    title: "Mobile App Configuration",
    description: "Mobile app metadata, minimum supported versions, maintenance state, and support info.",
    authRequired: false,
  },
  {
    id: "system-health",
    method: "GET",
    path: "/api/v1/system/health",
    category: "System",
    title: "System Health Status",
    description: "Uptime, database connectivity, and platform component status.",
    authRequired: false,
  },
];

export default function ApiDocsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [authToken, setAuthToken] = useState<string>("");
  const [requestBodyText, setRequestBodyText] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [codeLanguage, setCodeLanguage] = useState<"curl" | "kotlin" | "swift">("curl");

  useEffect(() => {
    if (activeEndpoint.sampleBody) {
      setRequestBodyText(JSON.stringify(activeEndpoint.sampleBody, null, 2));
    } else {
      setRequestBodyText("");
    }
    setApiResponse(null);
  }, [activeEndpoint]);

  const categories = ["All", "Auth", "Wallet", "Orders", "Payments", "Services", "Academy", "Shop", "System"];

  const filteredEndpoints = selectedCategory === "All"
    ? ENDPOINTS
    : ENDPOINTS.filter((e) => e.category === selectedCategory);

  const handleTestCall = async () => {
    setIsLoading(true);
    setApiResponse(null);
    try {
      const url = activeEndpoint.path + (activeEndpoint.sampleQuery || "");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authToken.trim()) {
        headers["Authorization"] = `Bearer ${authToken.trim()}`;
      }

      const options: RequestInit = {
        method: activeEndpoint.method,
        headers,
      };

      if (["POST", "PATCH", "PUT"].includes(activeEndpoint.method) && requestBodyText.trim()) {
        options.body = requestBodyText;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setApiResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });

      // If this was a login call, automatically extract token for convenience
      if (data?.data?.token) {
        setAuthToken(data.data.token);
      }
    } catch (err: any) {
      setApiResponse({
        error: err.message || "Failed to execute request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurlSnippet = (ep: EndpointDoc) => {
    const url = `https://hambaktech.com.ng${ep.path}${ep.sampleQuery || ""}`;
    let snippet = `curl -X ${ep.method} "${url}" \\\n  -H "Content-Type: application/json"`;
    if (ep.authRequired || authToken) {
      snippet += ` \\\n  -H "Authorization: Bearer ${authToken || "<YOUR_SESSION_TOKEN>"}"`;
    }
    if (ep.sampleBody) {
      snippet += ` \\\n  -d '${JSON.stringify(ep.sampleBody)}'`;
    }
    return snippet;
  };

  const getKotlinSnippet = (ep: EndpointDoc) => {
    return `// Android Kotlin (OkHttp / Retrofit)
val client = OkHttpClient()
val mediaType = "application/json; charset=utf-8".toMediaType()
val body = """${JSON.stringify(ep.sampleBody || {}, null, 2)}""".toRequestBody(mediaType)

val request = Request.Builder()
    .url("https://hambaktech.com.ng${ep.path}")
    .addHeader("Authorization", "Bearer ${authToken || "<SESSION_TOKEN>"}")
    .${ep.method.toLowerCase()}(${["POST", "PATCH"].includes(ep.method) ? "body" : ""})
    .build()

client.newCall(request).enqueue(object : Callback {
    override fun onResponse(call: Call, response: Response) {
        println(response.body?.string())
    }
    override fun onFailure(call: Call, e: IOException) {
        e.printStackTrace()
    }
})`;
  };

  const getSwiftSnippet = (ep: EndpointDoc) => {
    return `// iOS Swift (URLSession)
guard let url = URL(string: "https://hambaktech.com.ng${ep.path}") else { return }
var request = URLRequest(url: url)
request.httpMethod = "${ep.method}"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.setValue("Bearer ${authToken || "<SESSION_TOKEN>"}", forHTTPHeaderField: "Authorization")
${ep.sampleBody ? `request.httpBody = """${JSON.stringify(ep.sampleBody)}""".data(using: .utf8)` : ""}

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let data = data, let json = try? JSONSerialization.jsonObject(with: data) {
        print(json)
    }
}
task.resume()`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="border-b border-slate-800 pb-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
                <Smartphone className="w-3.5 h-3.5" />
                M11 — Mobile API Engine
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Unified Authoritative API Console
              </h1>
              <p className="mt-2 text-base text-slate-400 max-w-3xl">
                Single authoritative backend serving Web, Android, and iOS clients. Zero duplicated business logic, server-enforced security, authoritative wallet ledger, and dynamic pricing.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/api/v1/openapi.json"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 text-sm font-medium transition"
              >
                <Code2 className="w-4 h-4 text-emerald-400" />
                OpenAPI 3.0 JSON
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <a
                href="/api/v1/system/health"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition shadow-lg shadow-emerald-950"
              >
                <Server className="w-4 h-4" />
                Health Check
              </a>
            </div>
          </div>

          {/* Architecture Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Shield className="w-4 h-4" />
                Server Authoritative
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero client-side trust. Prices, ledger balances, and order totals calculated on server.
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                <CreditCard className="w-4 h-4" />
                Single Shared Wallet
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Balances synchronize instantly between Web, Android, and iOS via double-entry ledger.
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Smartphone className="w-4 h-4" />
                Multi-Client Auth
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Standard Bearer authorization header with automatic session revocation and renewal.
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Terminal className="w-4 h-4" />
                Native SDK Ready
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ready for Retrofit (Android), URLSession (iOS), and Dio (Flutter) integration.
              </p>
            </div>
          </div>
        </div>

        {/* Global Bearer Token Input for Testing */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300 min-w-fit">
            <Shield className="w-4 h-4 text-emerald-400" />
            Active Session Token:
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Paste Bearer token (or click 'User Login' below to auto-populate)"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Auto-fill demo customer token
                setAuthToken("demo-auth-token-usr-customer-01");
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline"
            >
              Demo Token
            </button>
            <button
              onClick={() => setAuthToken("")}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Grid: Sidebar List + Detail Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Endpoints Sidebar */}
          <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-2">
            {filteredEndpoints.map((ep) => {
              const isSelected = activeEndpoint.id === ep.id;
              const methodBadgeClass =
                ep.method === "GET"
                  ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                  : ep.method === "POST"
                  ? "bg-blue-950/80 text-blue-400 border-blue-800/60"
                  : ep.method === "PATCH"
                  ? "bg-amber-950/80 text-amber-400 border-amber-800/60"
                  : "bg-red-950/80 text-red-400 border-red-800/60";

              return (
                <button
                  key={ep.id}
                  onClick={() => setActiveEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-slate-900 border-emerald-500/60 shadow-md shadow-slate-950"
                      : "bg-slate-950 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${methodBadgeClass}`}>
                        {ep.method}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {ep.title}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {ep.path}
                    </div>
                  </div>
                  {ep.authRequired && (
                    <span title="Authentication Required">
                      <Shield className="w-3.5 h-3.5 text-amber-400 mt-1 shrink-0" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Endpoint Detail & Interactive Runner */}
          <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
            {/* Title & Path */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-1 rounded border ${
                      activeEndpoint.method === "GET"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : "bg-blue-950 text-blue-400 border-blue-800"
                    }`}
                  >
                    {activeEndpoint.method}
                  </span>
                  <span className="text-lg font-mono font-bold text-white">
                    {activeEndpoint.path}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                    {activeEndpoint.category}
                  </span>
                  {activeEndpoint.authRequired ? (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/40 flex items-center gap-1 font-medium">
                      <Shield className="w-3 h-3" />
                      Auth Required
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-medium">
                      Public
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-400">{activeEndpoint.description}</p>
            </div>

            {/* Request Body (if POST/PATCH) */}
            {["POST", "PATCH"].includes(activeEndpoint.method) && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Request Payload (JSON)
                </label>
                <textarea
                  rows={6}
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={handleTestCall}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-950 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Request...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Test Endpoint Now
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(["curl", "kotlin", "swift"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLanguage(lang)}
                    className={`px-3 py-1 rounded text-xs font-medium uppercase transition ${
                      codeLanguage === lang
                        ? "bg-slate-800 text-emerald-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Generator Snippet */}
            <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-xs text-slate-400 font-mono">
                <span>Client Code Snippet ({codeLanguage.toUpperCase()})</span>
                <button
                  onClick={() => {
                    const code =
                      codeLanguage === "curl"
                        ? getCurlSnippet(activeEndpoint)
                        : codeLanguage === "kotlin"
                        ? getKotlinSnippet(activeEndpoint)
                        : getSwiftSnippet(activeEndpoint);
                    copyToClipboard(code, "code");
                  }}
                  className="flex items-center gap-1 text-slate-300 hover:text-emerald-400"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedCode === "code" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre p-2 bg-slate-900/50 rounded-lg">
                {codeLanguage === "curl"
                  ? getCurlSnippet(activeEndpoint)
                  : codeLanguage === "kotlin"
                  ? getKotlinSnippet(activeEndpoint)
                  : getSwiftSnippet(activeEndpoint)}
              </pre>
            </div>

            {/* Live Response Panel */}
            {apiResponse && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                  <span className="text-slate-300">Live API Response</span>
                  {apiResponse.status && (
                    <span
                      className={`font-mono px-2 py-0.5 rounded text-[11px] ${
                        apiResponse.status < 300
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-red-950 text-red-400 border border-red-800"
                      }`}
                    >
                      HTTP {apiResponse.status} {apiResponse.statusText}
                    </span>
                  )}
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-80 overflow-y-auto">
                  <pre className="text-xs font-mono text-slate-200">
                    {JSON.stringify(apiResponse.data || apiResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
