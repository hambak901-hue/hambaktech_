"use client";

import {
  User,
  Wallet,
  WalletLedgerEntry,
  Transaction,
  Order,
  OrderStatus,
  NINRequest,
  CACRequest,
  AcademyEnrollment,
  SupportTicket,
  PriceRule,
  SystemProvider,
  CMSAnnouncement,
  AuditLogEntry,
  NotificationItem,
  TelecomNetwork,
  ElectricityDisco,
  CableTVProvider,
} from "@/types/platform";
import { companyConfig } from "@/data/companyConfig";

// Default seed users
const INITIAL_CUSTOMER: User = {
  id: "usr-cust-001",
  email: "customer@hambaktech.com.ng",
  phone: "08147837664",
  fullName: "Oluwaseun Adeyemi",
  role: "customer",
  status: "ACTIVE",
  state: "Lagos State",
  lga: "Ibeju-Lekki",
  address: "12 Eleko Junction Way, Ibeju-Lekki",
  createdAt: "2026-01-15T10:30:00Z",
};

const INITIAL_ADMIN: User = {
  id: "usr-adm-001",
  email: "admin@hambaktech.com.ng",
  phone: "09155104724",
  fullName: "Hambak Administrator",
  role: "admin",
  status: "ACTIVE",
  state: "Lagos State",
  lga: "Ibeju-Lekki",
  address: "HambakTech Hub, Origanrigan Cele Area",
  createdAt: "2026-01-01T08:00:00Z",
};

const INITIAL_WALLET: Wallet = {
  id: "wal-001",
  userId: INITIAL_CUSTOMER.id,
  currency: "NGN",
  currentBalance: 48500,
  ledgerBalance: 48500,
  lockedBalance: 0,
  status: "ACTIVE",
  updatedAt: new Date().toISOString(),
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-101",
    reference: "HT-TX-2026-091101",
    userId: INITIAL_CUSTOMER.id,
    userName: INITIAL_CUSTOMER.fullName,
    type: "WALLET_TOPUP",
    amount: 50000,
    fee: 0,
    currency: "NGN",
    status: "SUCCESSFUL",
    paymentMethod: "PAYSTACK",
    description: "Wallet Funding via Card Transfer",
    createdAt: "2026-09-11T09:14:22Z",
  },
  {
    id: "tx-102",
    reference: "HT-TX-2026-091102",
    userId: INITIAL_CUSTOMER.id,
    userName: INITIAL_CUSTOMER.fullName,
    type: "VTU_DATA",
    amount: 1500,
    fee: 0,
    currency: "NGN",
    status: "SUCCESSFUL",
    paymentMethod: "WALLET",
    description: "MTN SME Data 2.5GB (08147837664)",
    createdAt: "2026-09-11T11:45:00Z",
  },
  {
    id: "tx-103",
    reference: "HT-TX-2026-091201",
    userId: INITIAL_CUSTOMER.id,
    userName: INITIAL_CUSTOMER.fullName,
    type: "CAC_SERVICE",
    amount: 22000,
    fee: 500,
    currency: "NGN",
    status: "SUCCESSFUL",
    paymentMethod: "WALLET",
    description: "CAC Business Name Registration - Adeyemi Enterprises",
    createdAt: "2026-09-12T14:20:10Z",
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-101",
    orderNumber: "HT-ORD-2026-0081",
    userId: INITIAL_CUSTOMER.id,
    userName: INITIAL_CUSTOMER.fullName,
    userEmail: INITIAL_CUSTOMER.email,
    userPhone: INITIAL_CUSTOMER.phone,
    serviceCategorySlug: "cac-registration",
    serviceCategoryName: "Business Registration (CAC)",
    serviceTitle: "Business Name Registration Advisory",
    status: "PROCESSING",
    paymentStatus: "PAID",
    totalAmount: 22000,
    feeAmount: 500,
    currency: "NGN",
    items: [
      { title: "CAC Name Search & Reservation", quantity: 1, unitPrice: 5000 },
      { title: "Business Name Filing & Certificate Retrieval", quantity: 1, unitPrice: 17000 },
    ],
    statusTimeline: [
      { status: "PENDING", timestamp: "2026-09-12T14:20:10Z", note: "Order initiated and payment verified." },
      { status: "PROCESSING", timestamp: "2026-09-12T15:30:00Z", note: "Name reservation cleared on CAC portal." },
    ],
    deliveryType: "ONLINE_PORTAL",
    notes: "Certificate to be forwarded to client email upon statutory clearance.",
    createdAt: "2026-09-12T14:20:10Z",
    updatedAt: "2026-09-12T15:30:00Z",
  },
  {
    id: "ord-102",
    orderNumber: "HT-ORD-2026-0042",
    userId: INITIAL_CUSTOMER.id,
    userName: INITIAL_CUSTOMER.fullName,
    userEmail: INITIAL_CUSTOMER.email,
    userPhone: INITIAL_CUSTOMER.phone,
    serviceCategorySlug: "printing",
    serviceCategoryName: "Printing",
    serviceTitle: "Custom Corporate Business Cards (300 Units)",
    status: "COMPLETED",
    paymentStatus: "PAID",
    totalAmount: 12500,
    feeAmount: 0,
    currency: "NGN",
    items: [
      { title: "Matte Finish Business Cards (300 pcs)", quantity: 3, unitPrice: 4166.66 },
    ],
    statusTimeline: [
      { status: "PENDING", timestamp: "2026-09-08T10:00:00Z", note: "Artwork proof approved by client." },
      { status: "PROCESSING", timestamp: "2026-09-08T14:00:00Z", note: "Printing and matte lamination underway." },
      { status: "COMPLETED", timestamp: "2026-09-09T12:00:00Z", note: "Picked up at Ibeju-Lekki business centre." },
    ],
    deliveryType: "PHYSICAL_PICKUP",
    createdAt: "2026-09-08T10:00:00Z",
    updatedAt: "2026-09-09T12:00:00Z",
  },
  {
    id: "ord-103",
    orderNumber: "HT-ORD-2026-0095",
    userId: INITIAL_CUSTOMER.id,
    userName: INITIAL_CUSTOMER.fullName,
    userEmail: INITIAL_CUSTOMER.email,
    userPhone: INITIAL_CUSTOMER.phone,
    serviceCategorySlug: "nin-services",
    serviceCategoryName: "NIN Centre",
    serviceTitle: "NIN Slip Verification & Plastic Card Print",
    status: "COMPLETED",
    paymentStatus: "PAID",
    totalAmount: 3500,
    feeAmount: 0,
    currency: "NGN",
    items: [
      { title: "Standard NIN Verification & Retrieval", quantity: 1, unitPrice: 1500 },
      { title: "Durable Thermal Plastic ID Card", quantity: 1, unitPrice: 2000 },
    ],
    statusTimeline: [
      { status: "PENDING", timestamp: "2026-09-10T11:00:00Z", note: "Verification initiated." },
      { status: "COMPLETED", timestamp: "2026-09-10T11:35:00Z", note: "Card printed and handed over in-store." },
    ],
    deliveryType: "PHYSICAL_PICKUP",
    createdAt: "2026-09-10T11:00:00Z",
    updatedAt: "2026-09-10T11:35:00Z",
  },
];

const INITIAL_NIN_REQUESTS: NINRequest[] = [
  {
    id: "nin-req-001",
    trackingNumber: "HT-NIN-2026-8812",
    userId: INITIAL_CUSTOMER.id,
    applicantName: "Oluwaseun Adeyemi",
    ninNumber: "38920194821",
    phone: "08147837664",
    email: "customer@hambaktech.com.ng",
    serviceType: "PLASTIC_ID_CARD",
    status: "READY_FOR_PICKUP",
    notes: "Plastic PVC card printed. Ready for pickup at Origanrigan desk.",
    submittedAt: "2026-09-11T09:30:00Z",
    updatedAt: "2026-09-12T10:00:00Z",
    pickupOffice: "HambakTech Hub, Origanrigan Cele Area, Lagos",
  },
  {
    id: "nin-req-002",
    trackingNumber: "HT-NIN-2026-8904",
    applicantName: "Fatima Sani Bello",
    phone: "08033221144",
    email: "fatima.bello@example.com",
    serviceType: "DATA_MODIFICATION",
    status: "DOCUMENT_VERIFICATION",
    notes: "Supporting birth certificate submitted for Date of Birth modification advisory.",
    submittedAt: "2026-09-13T08:15:00Z",
    updatedAt: "2026-09-13T09:00:00Z",
    pickupOffice: "HambakTech Hub, Origanrigan Cele Area, Lagos",
  },
];

const INITIAL_CAC_REQUESTS: CACRequest[] = [
  {
    id: "cac-req-001",
    trackingNumber: "HT-CAC-2026-4402",
    userId: INITIAL_CUSTOMER.id,
    entityType: "BUSINESS_NAME",
    proposedName1: "Adeyemi Synergy Logistics",
    proposedName2: "Adeyemi Freight Express",
    natureOfBusiness: "Haulage, logistics and local courier delivery services",
    applicantName: "Oluwaseun Adeyemi",
    applicantPhone: "08147837664",
    applicantEmail: "customer@hambaktech.com.ng",
    directorsCount: 1,
    status: "NAME_RESERVATION",
    portalSubmissionRef: "CAC/BN/2026/09/88123",
    notes: "Name reservation awaiting final approval on CAC portal.",
    submittedAt: "2026-09-12T14:20:10Z",
    updatedAt: "2026-09-12T15:30:00Z",
  },
];

const INITIAL_ENROLLMENTS: AcademyEnrollment[] = [
  {
    id: "enr-001",
    userId: INITIAL_CUSTOMER.id,
    courseId: "web-development",
    courseTitle: "Web Development Foundations (Frontend & Design)",
    studentName: "Oluwaseun Adeyemi",
    studentEmail: "customer@hambaktech.com.ng",
    cohort: "Cohort Q3 2026 (Evening)",
    progressPercent: 65,
    status: "IN_PROGRESS",
    completedModules: [1, 2, 3, 4],
    certificateIssued: false,
    enrolledAt: "2026-08-01T10:00:00Z",
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "tkt-001",
    ticketNumber: "HT-TKT-9912",
    userId: INITIAL_CUSTOMER.id,
    userName: "Oluwaseun Adeyemi",
    userEmail: "customer@hambaktech.com.ng",
    category: "CAC_DESK",
    subject: "Inquiry on CAC Status Report Delivery",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    messages: [
      {
        id: "msg-1",
        senderId: INITIAL_CUSTOMER.id,
        senderName: "Oluwaseun Adeyemi",
        senderRole: "customer",
        content: "Hello HambakTech Desk, please confirm if my CAC status report will be emailed or if I need to collect a hard copy in Ibeju-Lekki?",
        timestamp: "2026-09-12T16:00:00Z",
      },
      {
        id: "msg-2",
        senderId: "adm-001",
        senderName: "Hambak Corporate Officer",
        senderRole: "admin",
        content: "Hello Mr. Adeyemi, once the CAC portal approves the registration, the official digital Status Report & Certificate with verifiable QR code is automatically emailed to you, and we also keep a complimentary laminated hard copy at our front desk.",
        timestamp: "2026-09-12T16:45:00Z",
      },
    ],
    createdAt: "2026-09-12T16:00:00Z",
    updatedAt: "2026-09-12T16:45:00Z",
  },
];

const INITIAL_PRICE_RULES: PriceRule[] = [
  {
    id: "pr-1",
    serviceName: "MTN SME Data 1GB",
    serviceCategory: "VTU_BILLS",
    provider: "VTU Kingpin API",
    providerCost: 260,
    sellingPrice: 320,
    markupPercent: 23,
    serviceFee: 0,
    customerTier: "STANDARD",
    isActive: true,
    effectiveDate: "2026-09-01",
  },
  {
    id: "pr-2",
    serviceName: "Airtel SME Data 1GB",
    serviceCategory: "VTU_BILLS",
    provider: "VTU Kingpin API",
    providerCost: 275,
    sellingPrice: 340,
    markupPercent: 23.6,
    serviceFee: 0,
    customerTier: "STANDARD",
    isActive: true,
    effectiveDate: "2026-09-01",
  },
  {
    id: "pr-3",
    serviceName: "Electricity DISCO Token Fee",
    serviceCategory: "VTU_BILLS",
    provider: "Baxi / Remita Switch",
    providerCost: 50,
    sellingPrice: 100,
    markupPercent: 100,
    serviceFee: 100,
    customerTier: "STANDARD",
    isActive: true,
    effectiveDate: "2026-09-01",
  },
  {
    id: "pr-4",
    serviceName: "CAC Business Name Registration",
    serviceCategory: "DIGITAL_PORTALS",
    provider: "CAC Official Desk",
    providerCost: 10000,
    sellingPrice: 22000,
    markupPercent: 120,
    serviceFee: 500,
    customerTier: "STANDARD",
    isActive: true,
    effectiveDate: "2026-09-01",
  },
];

const INITIAL_SYSTEM_PROVIDERS: SystemProvider[] = [
  {
    id: "prov-1",
    name: "Paystack Nigeria",
    code: "PAYSTACK",
    type: "PAYMENT_GATEWAY",
    environment: "PRODUCTION",
    isActive: true,
    successRate: 99.8,
  },
  {
    id: "prov-2",
    name: "Flutterwave",
    code: "FLUTTERWAVE",
    type: "PAYMENT_GATEWAY",
    environment: "PRODUCTION",
    isActive: true,
    successRate: 99.1,
  },
  {
    id: "prov-3",
    name: "Telecom VTU Bridge",
    code: "VTU_GATEWAY",
    type: "TELECOM_VTU",
    environment: "PRODUCTION",
    isActive: true,
    successRate: 98.6,
    balance: 420800,
  },
  {
    id: "prov-4",
    name: "DISCO Power Gateway",
    code: "DISCO_API",
    type: "UTILITY_DISCO",
    environment: "PRODUCTION",
    isActive: true,
    successRate: 99.4,
  },
];

const INITIAL_ANNOUNCEMENTS: CMSAnnouncement[] = [
  {
    id: "ann-1",
    title: "Academy Q4 Cohort Registration is Now Open",
    message: "Early bird registration is open for Web Development, Graphic Design, and Advanced Excel courses.",
    category: "GENERAL",
    isActive: true,
    createdAt: "2026-09-10T08:00:00Z",
  },
  {
    id: "ann-2",
    title: "Express NIN Plastic Card Printing Available Walk-in",
    message: "Get heavy-duty laminated and plastic identification cards printed within 15 minutes at our Ibeju-Lekki centre.",
    category: "PROMOTION",
    isActive: true,
    createdAt: "2026-09-12T09:00:00Z",
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-09-13T12:00:00Z",
    actorName: "Hambak Administrator",
    actorEmail: "admin@hambaktech.com.ng",
    role: "admin",
    action: "UPDATE_STATUS",
    entity: "ORDER",
    entityId: "ord-101",
    ipAddress: "102.89.44.12",
    status: "SUCCESS",
  },
  {
    id: "aud-002",
    timestamp: "2026-09-12T14:20:10Z",
    actorName: "Oluwaseun Adeyemi",
    actorEmail: "customer@hambaktech.com.ng",
    role: "customer",
    action: "CREATE_ORDER",
    entity: "ORDER",
    entityId: "ord-101",
    ipAddress: "105.112.98.54",
    status: "SUCCESS",
  },
  {
    id: "aud-003",
    timestamp: "2026-09-11T09:14:22Z",
    actorName: "Oluwaseun Adeyemi",
    actorEmail: "customer@hambaktech.com.ng",
    role: "customer",
    action: "WALLET_TOPUP",
    entity: "WALLET",
    entityId: "wal-001",
    ipAddress: "105.112.98.54",
    status: "SUCCESS",
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Wallet Top-up Successful",
    message: "₦25,000 top-up has been credited to your digital wallet via Paystack.",
    type: "TRANSACTION",
    read: false,
    createdAt: "2026-09-11T09:15:00Z",
    actionUrl: "/dashboard/wallet/transactions",
  },
  {
    id: "notif-2",
    title: "CAC Name Reservation Received",
    message: "Your application for 'Adeyemi Synergy Logistics' is now in Name Reservation status.",
    type: "ORDER",
    read: false,
    createdAt: "2026-09-12T14:25:00Z",
    actionUrl: "/dashboard/cac",
  },
  {
    id: "notif-3",
    title: "Express Plastic NIN Printing Active",
    message: "You can now request high-durability plastic PVC NIN cards directly from your desk.",
    type: "ANNOUNCEMENT",
    read: true,
    createdAt: "2026-09-10T08:00:00Z",
    actionUrl: "/dashboard/nin",
  },
];

// --------------------------------------------------------------------------
// In-Memory & LocalStorage Persisted Reactive Store
// --------------------------------------------------------------------------
class PlatformStore {
  private user: User = INITIAL_CUSTOMER;
  private wallet: Wallet = INITIAL_WALLET;
  private transactions: Transaction[] = INITIAL_TRANSACTIONS;
  private orders: Order[] = INITIAL_ORDERS;
  private ninRequests: NINRequest[] = INITIAL_NIN_REQUESTS;
  private cacRequests: CACRequest[] = INITIAL_CAC_REQUESTS;
  private enrollments: AcademyEnrollment[] = INITIAL_ENROLLMENTS;
  private tickets: SupportTicket[] = INITIAL_TICKETS;
  private priceRules: PriceRule[] = INITIAL_PRICE_RULES;
  private providers: SystemProvider[] = INITIAL_SYSTEM_PROVIDERS;
  private announcements: CMSAnnouncement[] = INITIAL_ANNOUNCEMENTS;
  private auditLogs: AuditLogEntry[] = INITIAL_AUDIT_LOGS;
  private notifications: NotificationItem[] = INITIAL_NOTIFICATIONS;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const savedUser = localStorage.getItem("ht_current_user");
      if (savedUser) this.user = JSON.parse(savedUser);

      const savedWallet = localStorage.getItem("ht_wallet");
      if (savedWallet) this.wallet = JSON.parse(savedWallet);

      const savedTx = localStorage.getItem("ht_transactions");
      if (savedTx) this.transactions = JSON.parse(savedTx);

      const savedOrders = localStorage.getItem("ht_orders");
      if (savedOrders) this.orders = JSON.parse(savedOrders);

      const savedNIN = localStorage.getItem("ht_nin");
      if (savedNIN) this.ninRequests = JSON.parse(savedNIN);

      const savedCAC = localStorage.getItem("ht_cac");
      if (savedCAC) this.cacRequests = JSON.parse(savedCAC);

      const savedEnr = localStorage.getItem("ht_enrollments");
      if (savedEnr) this.enrollments = JSON.parse(savedEnr);

      const savedTkt = localStorage.getItem("ht_tickets");
      if (savedTkt) this.tickets = JSON.parse(savedTkt);
    } catch {
      // ignore storage errors
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ht_current_user", JSON.stringify(this.user));
      localStorage.setItem("ht_wallet", JSON.stringify(this.wallet));
      localStorage.setItem("ht_transactions", JSON.stringify(this.transactions));
      localStorage.setItem("ht_orders", JSON.stringify(this.orders));
      localStorage.setItem("ht_nin", JSON.stringify(this.ninRequests));
      localStorage.setItem("ht_cac", JSON.stringify(this.cacRequests));
      localStorage.setItem("ht_enrollments", JSON.stringify(this.enrollments));
      localStorage.setItem("ht_tickets", JSON.stringify(this.tickets));
    } catch {
      // storage unavailable
    }
  }

  // --- User & Authentication ---
  getCurrentUser(): User {
    return this.user;
  }

  switchRole(role: "customer" | "admin" | "CUSTOMER" | "ADMIN"): User {
    const normalized = role.toLowerCase() as "customer" | "admin";
    this.user = normalized === "admin" ? INITIAL_ADMIN : INITIAL_CUSTOMER;
    this.saveToStorage();
    return this.user;
  }

  updateProfile(data: Partial<User>): User {
    this.user = { ...this.user, ...data };
    this.saveToStorage();
    return this.user;
  }

  updateUserProfile(data: Partial<User>): User {
    return this.updateProfile(data);
  }

  // --- Wallet & Ledger ---
  getWallet(): Wallet {
    return this.wallet;
  }

  fundWallet(amount: number, method: string, reference?: string): { success: boolean; transaction: Transaction; newBalance: number } {
    const ref = reference || `HT-TX-${Date.now()}`;
    const newBalance = this.wallet.currentBalance + amount;

    this.wallet = {
      ...this.wallet,
      currentBalance: newBalance,
      ledgerBalance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      userId: this.user.id,
      userName: this.user.fullName,
      type: "WALLET_TOPUP",
      amount,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: (method.toUpperCase() as Transaction["paymentMethod"]) || "PAYSTACK",
      description: `Wallet Top-up via ${method}`,
      createdAt: new Date().toISOString(),
    };

    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    return { success: true, transaction: newTx, newBalance };
  }

  // --- Transactions ---
  getTransactions(filter?: { type?: string; status?: string; search?: string }): Transaction[] {
    let list = [...this.transactions];
    if (filter?.type && filter.type !== "ALL") {
      list = list.filter((t) => t.type === filter.type);
    }
    if (filter?.status && filter.status !== "ALL") {
      list = list.filter((t) => t.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.reference.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return list;
  }

  // --- Orders ---
  getOrders(filter?: { status?: string; search?: string }): Order[] {
    let list = [...this.orders];
    if (filter?.status && filter.status !== "ALL") {
      list = list.filter((o) => o.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.serviceTitle.toLowerCase().includes(q) ||
          o.serviceCategoryName.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  createOrder(params: {
    serviceCategorySlug: string;
    serviceCategoryName: string;
    serviceTitle: string;
    totalAmount: number;
    feeAmount?: number;
    items: Array<{ title: string; quantity: number; unitPrice: number }>;
    deliveryType: Order["deliveryType"];
    notes?: string;
    paymentMethod: "WALLET" | "PAYSTACK" | "FLUTTERWAVE" | "BANK_TRANSFER" | "CASH";
  }): { success: boolean; order?: Order; error?: string } {
    const fee = params.feeAmount || 0;
    const grandTotal = params.totalAmount + fee;

    // If paying with wallet, check balance
    if (params.paymentMethod === "WALLET") {
      if (this.wallet.currentBalance < grandTotal) {
        return { success: false, error: "Insufficient wallet balance. Please fund your wallet or choose another payment method." };
      }
      this.wallet.currentBalance -= grandTotal;
      this.wallet.ledgerBalance -= grandTotal;
    }

    const orderNum = `HT-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      userId: this.user.id,
      userName: this.user.fullName,
      userEmail: this.user.email,
      userPhone: this.user.phone,
      serviceCategorySlug: params.serviceCategorySlug,
      serviceCategoryName: params.serviceCategoryName,
      serviceTitle: params.serviceTitle,
      status: "PROCESSING",
      paymentStatus: "PAID",
      totalAmount: params.totalAmount,
      feeAmount: fee,
      currency: "NGN",
      items: params.items,
      statusTimeline: [
        { status: "PENDING", timestamp: new Date().toISOString(), note: "Order placed." },
        { status: "PROCESSING", timestamp: new Date().toISOString(), note: `Paid via ${params.paymentMethod}. Assigned to operations desk.` },
      ],
      deliveryType: params.deliveryType,
      notes: params.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: `HT-TX-${Date.now()}`,
      userId: this.user.id,
      userName: this.user.fullName,
      type: "ORDER_PAYMENT",
      amount: grandTotal,
      fee,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: params.paymentMethod,
      description: `${params.serviceTitle} (${orderNum})`,
      createdAt: new Date().toISOString(),
    };

    this.orders = [newOrder, ...this.orders];
    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    return { success: true, order: newOrder };
  }

  updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Order | null {
    const idx = this.orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) return null;

    const ord = this.orders[idx];
    ord.status = status;
    ord.updatedAt = new Date().toISOString();
    ord.statusTimeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order updated to ${status}`,
    });

    this.orders[idx] = { ...ord };
    this.saveToStorage();
    return this.orders[idx];
  }

  // --- VTU & Bill Validation / Execution ---
  validateAccount(type: "ELECTRICITY" | "CABLE_TV" | "PHONE", identifier: string, provider: string): {
    valid: boolean;
    customerName: string;
    accountDetails?: string;
  } {
    if (!identifier || identifier.length < 4) {
      return { valid: false, customerName: "" };
    }
    // Realistic simulation of provider lookup response
    if (type === "ELECTRICITY") {
      const names = ["ADEKUNLE O. (PREPAID)", "IBEJU COMMUNITY PROPERTIES", "CHINEDU & SONS COMM.", "ALHAJI YAKUBU T."];
      const selected = names[Math.abs(identifier.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % names.length];
      return {
        valid: true,
        customerName: selected,
        accountDetails: `${provider} - Meter ${identifier} (Active)`,
      };
    } else if (type === "CABLE_TV") {
      const names = ["KOLAPO WILLIAMS", "EMMANUEL CHIDI", "HAJIA AMINA LAWAL", "CHIEF MRS B. DAVIES"];
      const selected = names[Math.abs(identifier.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % names.length];
      return {
        valid: true,
        customerName: selected,
        accountDetails: `${provider} Smartcard ${identifier} (Bouquet Active)`,
      };
    } else {
      return {
        valid: true,
        customerName: "Nigerian Mobile Subscriber",
        accountDetails: `${provider} Line Verified`,
      };
    }
  }

  processVTU(params: {
    type: "AIRTIME" | "DATA" | "ELECTRICITY" | "CABLE_TV";
    networkOrProvider: string;
    recipient: string;
    amount: number;
    planName?: string;
    paymentMethod: "WALLET" | "PAYSTACK";
  }): { success: boolean; token?: string; reference: string; error?: string } {
    const grandTotal = params.amount;
    if (params.paymentMethod === "WALLET") {
      if (this.wallet.currentBalance < grandTotal) {
        return { success: false, reference: "", error: "Insufficient wallet balance. Please fund your wallet." };
      }
      this.wallet.currentBalance -= grandTotal;
      this.wallet.ledgerBalance -= grandTotal;
    }

    const ref = `HT-VTU-${Date.now()}`;
    // Generate realistic simulated electricity token if applicable
    let token: string | undefined;
    if (params.type === "ELECTRICITY") {
      token = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const txTypeMap: Record<string, Transaction["type"]> = {
      AIRTIME: "VTU_AIRTIME",
      DATA: "VTU_DATA",
      ELECTRICITY: "ELECTRICITY_BILL",
      CABLE_TV: "CABLE_TV",
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      userId: this.user.id,
      userName: this.user.fullName,
      type: txTypeMap[params.type] || "VTU_AIRTIME",
      amount: grandTotal,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: params.paymentMethod,
      description: `${params.networkOrProvider} ${params.type} ${params.planName || `₦${params.amount}`} -> ${params.recipient}`,
      metadata: token ? { token, disco: params.networkOrProvider, meterNumber: params.recipient } : undefined,
      createdAt: new Date().toISOString(),
    };

    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    return { success: true, token, reference: ref };
  }

  // --- NIN Desk ---
  getNINRequests(): NINRequest[] {
    return this.ninRequests;
  }

  trackNINRequest(trackingNumber: string): NINRequest | undefined {
    const clean = trackingNumber.trim().toUpperCase();
    return this.ninRequests.find((r) => r.trackingNumber.toUpperCase() === clean);
  }

  submitNINRequest(params: Omit<NINRequest, "id" | "trackingNumber" | "status" | "submittedAt" | "updatedAt">): NINRequest {
    const trackNum = `HT-NIN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: NINRequest = {
      ...params,
      id: `nin-${Date.now()}`,
      trackingNumber: trackNum,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.ninRequests = [newReq, ...this.ninRequests];
    this.saveToStorage();
    return newReq;
  }

  createNINRequest(params: any): NINRequest & { referenceNumber: string } {
    if (params.amount && this.wallet.currentBalance >= params.amount) {
      this.wallet.currentBalance -= params.amount;
      this.wallet.ledgerBalance -= params.amount;
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        reference: `HT-NIN-${Date.now()}`,
        userId: this.user.id,
        userName: this.user.fullName,
        type: "SERVICE_PAYMENT",
        amount: params.amount,
        fee: 0,
        currency: "NGN",
        status: "SUCCESSFUL",
        paymentMethod: "WALLET",
        description: `NIN Desk: ${params.serviceType}`,
        createdAt: new Date().toISOString(),
      };
      this.transactions = [newTx, ...this.transactions];
    }
    const trackNum = `HT-NIN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: any = {
      id: `nin-${Date.now()}`,
      trackingNumber: trackNum,
      referenceNumber: trackNum,
      userId: this.user.id,
      applicantName: params.applicantName,
      ninNumber: params.ninNumber,
      phone: params.phone,
      email: params.email || this.user.email,
      serviceType: params.serviceType,
      status: "SUBMITTED",
      notes: params.notes,
      pickupOffice: params.pickupOffice || "Origanrigan Cele Area, Ibeju-Lekki, Lagos",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.ninRequests = [newReq, ...this.ninRequests];
    this.saveToStorage();
    return newReq;
  }

  updateNINStatus(id: string, status: NINRequest["status"], notes?: string): NINRequest | null {
    const idx = this.ninRequests.findIndex((n) => n.id === id || n.trackingNumber === id);
    if (idx === -1) return null;
    this.ninRequests[idx] = {
      ...this.ninRequests[idx],
      status,
      notes: notes || this.ninRequests[idx].notes,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.ninRequests[idx];
  }

  // --- CAC Desk ---
  getCACRequests(): CACRequest[] {
    return this.cacRequests;
  }

  trackCACRequest(trackingNumber: string): CACRequest | undefined {
    const clean = trackingNumber.trim().toUpperCase();
    return this.cacRequests.find((r) => r.trackingNumber.toUpperCase() === clean);
  }

  submitCACRequest(params: Omit<CACRequest, "id" | "trackingNumber" | "status" | "submittedAt" | "updatedAt">): CACRequest {
    const trackNum = `HT-CAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: CACRequest = {
      ...params,
      id: `cac-${Date.now()}`,
      trackingNumber: trackNum,
      status: "NAME_RESERVATION",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.cacRequests = [newReq, ...this.cacRequests];
    this.saveToStorage();
    return newReq;
  }

  createCACRequest(params: any): CACRequest & { referenceNumber: string } {
    if (params.amount && this.wallet.currentBalance >= params.amount) {
      this.wallet.currentBalance -= params.amount;
      this.wallet.ledgerBalance -= params.amount;
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        reference: `HT-CAC-${Date.now()}`,
        userId: this.user.id,
        userName: this.user.fullName,
        type: "SERVICE_PAYMENT",
        amount: params.amount,
        fee: 0,
        currency: "NGN",
        status: "SUCCESSFUL",
        paymentMethod: "WALLET",
        description: `CAC Filing: ${params.proposedName1}`,
        createdAt: new Date().toISOString(),
      };
      this.transactions = [newTx, ...this.transactions];
    }
    const trackNum = `HT-CAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: any = {
      id: `cac-${Date.now()}`,
      trackingNumber: trackNum,
      referenceNumber: trackNum,
      userId: this.user.id,
      entityType: params.registrationType || params.entityType || "BUSINESS_NAME",
      proposedName1: params.proposedName1,
      proposedName2: params.proposedName2,
      natureOfBusiness: params.natureOfBusiness,
      applicantName: params.proprietorName || params.applicantName,
      applicantPhone: params.proprietorPhone || params.applicantPhone || this.user.phone,
      applicantEmail: params.proprietorEmail || params.applicantEmail || this.user.email,
      directorsCount: params.directorsCount || 1,
      status: "NAME_RESERVATION",
      notes: params.notes || "Application submitted via online portal.",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.cacRequests = [newReq, ...this.cacRequests];
    this.saveToStorage();
    return newReq;
  }

  updateCACStatus(id: string, status: CACRequest["status"], notes?: string): CACRequest | null {
    const idx = this.cacRequests.findIndex((c) => c.id === id || c.trackingNumber === id);
    if (idx === -1) return null;
    this.cacRequests[idx] = {
      ...this.cacRequests[idx],
      status,
      notes: notes || this.cacRequests[idx].notes,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.cacRequests[idx];
  }

  // --- Academy ---
  getAcademyEnrollments(): AcademyEnrollment[] {
    return this.enrollments;
  }

  enrollInCourse(courseId: string, courseTitle: string): AcademyEnrollment {
    const existing = this.enrollments.find((e) => e.courseId === courseId);
    if (existing) return existing;

    const newEnr: AcademyEnrollment = {
      id: `enr-${Date.now()}`,
      userId: this.user.id,
      courseId,
      courseTitle,
      studentName: this.user.fullName,
      studentEmail: this.user.email,
      cohort: `Cohort ${new Date().toLocaleString("default", { month: "short" })} ${new Date().getFullYear()}`,
      progressPercent: 0,
      status: "ENROLLED",
      completedModules: [],
      certificateIssued: false,
      enrolledAt: new Date().toISOString(),
    };

    this.enrollments = [newEnr, ...this.enrollments];
    this.saveToStorage();
    return newEnr;
  }

  updateCourseProgress(courseId: string, moduleIdx: number): AcademyEnrollment | null {
    const idx = this.enrollments.findIndex((e) => e.courseId === courseId);
    if (idx === -1) return null;

    const enr = this.enrollments[idx];
    const completed = new Set(enr.completedModules);
    completed.add(moduleIdx);

    const totalModules = 6;
    const progress = Math.min(100, Math.round((completed.size / totalModules) * 100));
    const certReady = progress >= 100;

    this.enrollments[idx] = {
      ...enr,
      completedModules: Array.from(completed),
      progressPercent: progress,
      status: certReady ? "COMPLETED" : "IN_PROGRESS",
      certificateIssued: certReady,
      certificateNumber: certReady ? (enr.certificateNumber || `HT-ACAD-${Date.now().toString().slice(-6)}`) : undefined,
      certificateDate: certReady ? (enr.certificateDate || new Date().toISOString().split("T")[0]) : undefined,
    };

    this.saveToStorage();
    return this.enrollments[idx];
  }

  // --- Support ---
  getSupportTickets(): SupportTicket[] {
    return this.tickets;
  }

  getTickets(): SupportTicket[] {
    return this.tickets;
  }

  getSupportTicketById(id: string): SupportTicket | undefined {
    return this.tickets.find((t) => t.id === id || t.ticketNumber === id);
  }

  createSupportTicket(params: {
    category: SupportTicket["category"];
    subject: string;
    priority: SupportTicket["priority"];
    initialMessage: string;
  }): SupportTicket {
    const tktNum = `HT-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTkt: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: tktNum,
      userId: this.user.id,
      userName: this.user.fullName,
      userEmail: this.user.email,
      category: params.category,
      subject: params.subject,
      priority: params.priority,
      status: "OPEN",
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: this.user.id,
          senderName: this.user.fullName,
          senderRole: this.user.role,
          content: params.initialMessage,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tickets = [newTkt, ...this.tickets];
    this.saveToStorage();
    return newTkt;
  }

  replyToSupportTicket(ticketId: string, content: string): SupportTicket | null {
    const idx = this.tickets.findIndex((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (idx === -1) return null;

    const tkt = this.tickets[idx];
    tkt.messages.push({
      id: `msg-${Date.now()}`,
      senderId: this.user.id,
      senderName: this.user.fullName,
      senderRole: this.user.role,
      content,
      timestamp: new Date().toISOString(),
    });
    tkt.updatedAt = new Date().toISOString();
    tkt.status = this.user.role === "admin" ? "WAITING_ON_CUSTOMER" : "IN_PROGRESS";

    this.tickets[idx] = { ...tkt };
    this.saveToStorage();
    return this.tickets[idx];
  }

  // --- Admin Data ---
  getPriceRules(): PriceRule[] {
    return this.priceRules;
  }

  updatePriceRule(rule: PriceRule): void {
    const idx = this.priceRules.findIndex((p) => p.id === rule.id);
    if (idx !== -1) {
      this.priceRules[idx] = { ...rule };
    }
  }

  getSystemProviders(): SystemProvider[] {
    return this.providers;
  }

  toggleProvider(code: string, active: boolean): void {
    const prov = this.providers.find((p) => p.code === code);
    if (prov) {
      prov.isActive = active;
    }
  }

  getCMSAnnouncements(): CMSAnnouncement[] {
    return this.announcements;
  }

  getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  // --- Notifications ---
  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  markAllNotificationsAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  markNotificationAsRead(id: string): void {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
  }

  getReportMetrics() {
    const totalRev = this.transactions
      .filter((t) => t.status === "SUCCESSFUL" && t.type !== "WALLET_TOPUP")
      .reduce((acc, t) => acc + t.amount, 0);

    const successfulOrders = this.orders.filter((o) => o.status === "COMPLETED").length;
    const processingOrders = this.orders.filter((o) => o.status === "PROCESSING").length;

    return {
      totalRevenue: totalRev,
      activeUsers: 142,
      totalOrders: this.orders.length,
      successfulOrders,
      processingOrders,
      pendingRequests: this.ninRequests.length + this.cacRequests.length,
      openTickets: this.tickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED").length,
      vtuWalletBalance: 420800,
    };
  }
}

export const platformApi = new PlatformStore();
export default platformApi;
