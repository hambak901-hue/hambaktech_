"use client";

/**
 * ============================================================================
 * TRANSITIONAL FRONTEND SIMULATION CLIENT
 * ============================================================================
 * NOTE: This client-side store and localStorage mechanism is strictly a
 * TRANSITIONAL MOCK STATE to enable interactive frontend and admin testing
 * without breaking existing UI components during Milestone 3.
 * 
 * The authoritative source of truth is the MySQL relational database defined in
 * `prisma/schema.prisma`. In subsequent milestones, this file will be replaced
 * by HTTP API client calls targeting server-side Next.js/PHP backend endpoints.
 * ============================================================================
 */

import {
  User,
  RoleSlug,
  UserStatus,
  Wallet,
  WalletLedgerEntry,
  Transaction,
  Order,
  OrderStatus,
  NINRequest,
  CACRequest,
  AcademyEnrollment,
  InstructorRecord,
  CourseRecord,
  CourseAssignmentRecord,
  AssignmentSubmissionRecord,
  CertificateRecord,
  StudentIdCardRecord,
  CertificateVerificationResult,
  ProductCategoryRecord,
  ProductRecord,
  ProductInventoryLogRecord,
  DeliveryZoneRecord,
  SupportTicket,
  PriceRule,
  SystemProvider,
  CMSAnnouncement,
  AuditLogEntry,
  NotificationItem,
  TelecomNetwork,
  ElectricityDisco,
  CableTVProvider,
  PaymentAttempt,
  CMSPage,
  BlogPost,
  ServiceCategoryRecord,
} from "@/types/platform";
import { ServiceCategory } from "@/types/service";
import { servicesData } from "@/data/servicesData";
import { companyConfig } from "@/data/companyConfig";

const INITIAL_SERVICES: ServiceCategory[] = [...servicesData];

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

// Default seed users
const INITIAL_USERS: User[] = [
  {
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
  },
  {
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
  },
  {
    id: "usr-agt-002",
    email: "bello.reseller@gmail.com",
    phone: "08033221144",
    fullName: "Fatima Sani Bello",
    role: "agent",
    status: "ACTIVE",
    state: "Lagos State",
    lga: "Epe",
    address: "Plot 4 Marina Road, Epe",
    createdAt: "2026-02-10T14:20:00Z",
  },
  {
    id: "usr-stf-003",
    email: "kazeem.desk@hambaktech.com.ng",
    phone: "08099887766",
    fullName: "Kazeem Balogun",
    role: "staff",
    status: "ACTIVE",
    state: "Lagos State",
    lga: "Ibeju-Lekki",
    address: "Origanrigan Cele Area, Lagos",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "usr-inst-004",
    email: "instructor.emeka@hambaktech.com.ng",
    phone: "07011223344",
    fullName: "Engr. Emeka Nwosu",
    role: "instructor",
    status: "ACTIVE",
    state: "Lagos State",
    lga: "Ibeju-Lekki",
    address: "Lekki Free Zone corridor, Lagos",
    createdAt: "2026-01-20T11:00:00Z",
  },
  {
    id: "usr-cust-005",
    email: "chioma.okeke@yahoo.com",
    phone: "08123456789",
    fullName: "Chioma Okeke",
    role: "customer",
    status: "PENDING_VERIFICATION",
    state: "Lagos State",
    lga: "Ibeju-Lekki",
    address: "Akodo Village, Ibeju-Lekki",
    createdAt: "2026-09-10T16:45:00Z",
  },
];

const INITIAL_CUSTOMER: User = INITIAL_USERS[0];
const INITIAL_ADMIN: User = INITIAL_USERS[1];

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
    enrollmentNumber: "HT-ENR-2026-001",
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

const INITIAL_PAYMENT_ATTEMPTS: PaymentAttempt[] = [
  {
    id: "pay-att-101",
    reference: "HT-PAY-2026-091101",
    gateway: "PAYSTACK",
    amount: 50000,
    currency: "NGN",
    status: "SUCCESS",
    customerEmail: "customer@hambaktech.com.ng",
    customerName: "Oluwaseun Adeyemi",
    serviceType: "WALLET_FUNDING",
    channel: "card",
    gatewayResponse: "Approved by Issuer",
    createdAt: "2026-09-11T09:14:22Z",
  },
  {
    id: "pay-att-102",
    reference: "HT-PAY-2026-091201",
    gateway: "MONIEPOINT",
    amount: 22000,
    currency: "NGN",
    status: "SUCCESS",
    customerEmail: "customer@hambaktech.com.ng",
    customerName: "Oluwaseun Adeyemi",
    serviceType: "CAC_SERVICE",
    channel: "transfer",
    gatewayResponse: "Bank Transfer Settled",
    createdAt: "2026-09-12T14:20:10Z",
  },
  {
    id: "pay-att-103",
    reference: "HT-PAY-2026-091301",
    gateway: "FLUTTERWAVE",
    amount: 15000,
    currency: "NGN",
    status: "PENDING",
    customerEmail: "bello.reseller@gmail.com",
    customerName: "Fatima Sani Bello",
    serviceType: "WALLET_FUNDING",
    channel: "ussd",
    gatewayResponse: "Awaiting Customer Authorization",
    createdAt: "2026-09-13T10:15:00Z",
  },
];

const INITIAL_CMS_PAGES: CMSPage[] = [
  { id: "pg-1", slug: "about", title: "About HambakTech & Services", metaDescription: "Where Technology Meet Service in Ibeju-Lekki", published: true, updatedAt: "2026-09-10T12:00:00Z" },
  { id: "pg-2", slug: "services", title: "Digital Service Hub", metaDescription: "Telecom VTU, Business Centre, NIN, CAC & Printing", published: true, updatedAt: "2026-09-12T08:00:00Z" },
  { id: "pg-3", slug: "academy", title: "HambakTech Computer Training Academy", metaDescription: "Practical tech education and vocational digital skills", published: true, updatedAt: "2026-09-11T15:30:00Z" },
  { id: "pg-4", slug: "privacy-policy", title: "Privacy Policy & NDPR Compliance", metaDescription: "How HambakTech protects user data and records", published: true, updatedAt: "2026-08-20T10:00:00Z" },
  { id: "pg-5", slug: "terms-of-service", title: "Terms of Service & Usage Agreements", metaDescription: "Customer service level agreements and terms", published: true, updatedAt: "2026-08-20T10:00:00Z" },
];

const INITIAL_BLOG_POSTS: BlogPost[] = [
  { id: "post-1", slug: "how-to-register-business-with-cac-nigeria", title: "Complete Guide to Registering Your Business Name with CAC in 2026", summary: "Step-by-step guidance on name reservations, requirements, and avoiding rejection queries.", category: "Business Growth", author: "Hambak Liaison Desk", publishedAt: "2026-09-08T09:00:00Z", featured: true },
  { id: "post-2", slug: "nin-slip-reprint-and-plastic-id-solutions", title: "Everything You Need to Know About NIN Slip Verification & Plastic Cards", summary: "Understanding standard slip reprints, premium slips, and verified PVC cards.", category: "Identity Services", author: "NIN Operations Desk", publishedAt: "2026-09-05T14:30:00Z", featured: true },
  { id: "post-3", slug: "why-ibeju-lekki-youth-are-learning-web-development", title: "Tech Skills for the Future: Web Development & Office Automation in Ibeju-Lekki", summary: "How our vocational curriculum prepares students for digital enterprise and freelance work.", category: "Academy & Tech", author: "Engr. Emeka Nwosu", publishedAt: "2026-09-01T11:00:00Z", featured: false },
];

// --------------------------------------------------------------------------
// In-Memory & LocalStorage Persisted Reactive Store
// --------------------------------------------------------------------------
class PlatformStore {
  private user: User = INITIAL_CUSTOMER;
  private users: User[] = INITIAL_USERS;
  private services: ServiceCategory[] = INITIAL_SERVICES;
  private categories: ServiceCategoryRecord[] = INITIAL_CATEGORIES;
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
  private paymentAttempts: PaymentAttempt[] = INITIAL_PAYMENT_ATTEMPTS;
  private cmsPages: CMSPage[] = INITIAL_CMS_PAGES;
  private blogPosts: BlogPost[] = INITIAL_BLOG_POSTS;
  private userWallets: Record<string, Wallet> = {};

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const savedUser = localStorage.getItem("ht_current_user");
      if (savedUser) this.user = JSON.parse(savedUser);

      const savedUsers = localStorage.getItem("ht_users");
      if (savedUsers) this.users = JSON.parse(savedUsers);

      const savedServices = localStorage.getItem("ht_services");
      if (savedServices) this.services = JSON.parse(savedServices);

      const savedCategories = localStorage.getItem("ht_categories");
      if (savedCategories) this.categories = JSON.parse(savedCategories);

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

      const savedPriceRules = localStorage.getItem("ht_price_rules");
      if (savedPriceRules) this.priceRules = JSON.parse(savedPriceRules);

      const savedProviders = localStorage.getItem("ht_providers");
      if (savedProviders) this.providers = JSON.parse(savedProviders);

      const savedAnn = localStorage.getItem("ht_announcements");
      if (savedAnn) this.announcements = JSON.parse(savedAnn);

      const savedNotifs = localStorage.getItem("ht_notifications");
      if (savedNotifs) this.notifications = JSON.parse(savedNotifs);

      const savedPayments = localStorage.getItem("ht_payment_attempts");
      if (savedPayments) this.paymentAttempts = JSON.parse(savedPayments);

      const savedPages = localStorage.getItem("ht_cms_pages");
      if (savedPages) this.cmsPages = JSON.parse(savedPages);

      const savedPosts = localStorage.getItem("ht_blog_posts");
      if (savedPosts) this.blogPosts = JSON.parse(savedPosts);

      const savedAudit = localStorage.getItem("ht_audit_logs");
      if (savedAudit) this.auditLogs = JSON.parse(savedAudit);

      const savedUserWallets = localStorage.getItem("ht_user_wallets");
      if (savedUserWallets) this.userWallets = JSON.parse(savedUserWallets);
    } catch {
      // ignore storage errors
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ht_current_user", JSON.stringify(this.user));
      localStorage.setItem("ht_users", JSON.stringify(this.users));
      localStorage.setItem("ht_services", JSON.stringify(this.services));
      localStorage.setItem("ht_categories", JSON.stringify(this.categories));
      localStorage.setItem("ht_wallet", JSON.stringify(this.wallet));
      localStorage.setItem("ht_transactions", JSON.stringify(this.transactions));
      localStorage.setItem("ht_orders", JSON.stringify(this.orders));
      localStorage.setItem("ht_nin", JSON.stringify(this.ninRequests));
      localStorage.setItem("ht_cac", JSON.stringify(this.cacRequests));
      localStorage.setItem("ht_enrollments", JSON.stringify(this.enrollments));
      localStorage.setItem("ht_tickets", JSON.stringify(this.tickets));
      localStorage.setItem("ht_price_rules", JSON.stringify(this.priceRules));
      localStorage.setItem("ht_providers", JSON.stringify(this.providers));
      localStorage.setItem("ht_announcements", JSON.stringify(this.announcements));
      localStorage.setItem("ht_notifications", JSON.stringify(this.notifications));
      localStorage.setItem("ht_payment_attempts", JSON.stringify(this.paymentAttempts));
      localStorage.setItem("ht_cms_pages", JSON.stringify(this.cmsPages));
      localStorage.setItem("ht_blog_posts", JSON.stringify(this.blogPosts));
      localStorage.setItem("ht_audit_logs", JSON.stringify(this.auditLogs));
      localStorage.setItem("ht_user_wallets", JSON.stringify(this.userWallets));
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

  purchaseAirtime(network: string, phone: string, amount: number): Order {
    if (this.wallet.currentBalance < amount) {
      throw new Error("Insufficient wallet balance. Please fund your wallet.");
    }
    this.wallet.currentBalance -= amount;
    this.wallet.ledgerBalance -= amount;

    const orderNum = `HT-AIR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      userId: this.user.id,
      userName: this.user.fullName,
      userEmail: this.user.email,
      userPhone: phone || this.user.phone,
      serviceCategorySlug: "vtu-telecom",
      serviceCategoryName: "VTU & Telecoms",
      serviceTitle: `${network} Airtime Recharge - ₦${amount.toLocaleString()}`,
      status: "COMPLETED",
      paymentStatus: "PAID",
      paymentMethod: "WALLET",
      totalAmount: amount,
      feeAmount: 0,
      currency: "NGN",
      items: [{ title: `${network} Airtime to ${phone}`, quantity: 1, unitPrice: amount, serviceId: "AIRTIME" }],
      statusTimeline: [
        { status: "PENDING", timestamp: new Date().toISOString(), note: "Order placed" },
        { status: "PROCESSING", timestamp: new Date().toISOString(), note: `Routing through ${network} direct gateway` },
        { status: "COMPLETED", timestamp: new Date().toISOString(), note: "Delivered instantly" },
      ],
      deliveryType: "INSTANT_DIGITAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: orderNum,
      userId: this.user.id,
      userName: this.user.fullName,
      type: "VTU_AIRTIME",
      amount,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: "WALLET",
      description: `${network} Airtime ₦${amount} to ${phone}`,
      createdAt: new Date().toISOString(),
    };

    this.orders = [newOrder, ...this.orders];
    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    return newOrder;
  }

  purchaseData(network: string, phone: string, planId: string, amount: number): Order {
    if (this.wallet.currentBalance < amount) {
      throw new Error("Insufficient wallet balance. Please fund your wallet.");
    }
    this.wallet.currentBalance -= amount;
    this.wallet.ledgerBalance -= amount;

    const orderNum = `HT-DAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      userId: this.user.id,
      userName: this.user.fullName,
      userEmail: this.user.email,
      userPhone: phone || this.user.phone,
      serviceCategorySlug: "vtu-telecom",
      serviceCategoryName: "VTU & Telecoms",
      serviceTitle: `${network} Data Bundle (${planId}) - ₦${amount.toLocaleString()}`,
      status: "COMPLETED",
      paymentStatus: "PAID",
      paymentMethod: "WALLET",
      totalAmount: amount,
      feeAmount: 0,
      currency: "NGN",
      items: [{ title: `${network} Data (${planId}) to ${phone}`, quantity: 1, unitPrice: amount, serviceId: planId }],
      statusTimeline: [
        { status: "PENDING", timestamp: new Date().toISOString(), note: "Order placed" },
        { status: "PROCESSING", timestamp: new Date().toISOString(), note: `Activating package via ${network} SME/Direct API` },
        { status: "COMPLETED", timestamp: new Date().toISOString(), note: "Data credited to subscriber" },
      ],
      deliveryType: "INSTANT_DIGITAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: orderNum,
      userId: this.user.id,
      userName: this.user.fullName,
      type: "VTU_DATA",
      amount,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: "WALLET",
      description: `${network} Data (${planId}) to ${phone}`,
      createdAt: new Date().toISOString(),
    };

    this.orders = [newOrder, ...this.orders];
    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    return newOrder;
  }

  purchaseElectricity(disco: string, meterNumber: string, meterType: string, amount: number): Order {
    if (this.wallet.currentBalance < amount) {
      throw new Error("Insufficient wallet balance. Please fund your wallet.");
    }
    this.wallet.currentBalance -= amount;
    this.wallet.ledgerBalance -= amount;

    const token = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderNum = `HT-PWR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      userId: this.user.id,
      userName: this.user.fullName,
      userEmail: this.user.email,
      userPhone: this.user.phone,
      serviceCategorySlug: "utility-bills",
      serviceCategoryName: "Utility & Energy",
      serviceTitle: `${disco} (${meterType}) Meter ${meterNumber} - ₦${amount.toLocaleString()}`,
      status: "COMPLETED",
      paymentStatus: "PAID",
      paymentMethod: "WALLET",
      totalAmount: amount,
      feeAmount: 0,
      currency: "NGN",
      items: [{ title: `${disco} Token for Meter ${meterNumber}`, quantity: 1, unitPrice: amount, serviceId: meterType }],
      statusTimeline: [
        { status: "PENDING", timestamp: new Date().toISOString(), note: "Order placed" },
        { status: "PROCESSING", timestamp: new Date().toISOString(), note: `Vending token with ${disco} server` },
        { status: "COMPLETED", timestamp: new Date().toISOString(), note: `Token Generated: ${token}` },
      ],
      notes: `Vended Token: ${token}`,
      deliveryType: "INSTANT_DIGITAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: orderNum,
      userId: this.user.id,
      userName: this.user.fullName,
      type: "ELECTRICITY_BILL",
      amount,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: "WALLET",
      description: `${disco} Electricity Meter ${meterNumber}`,
      metadata: { token, disco, meterNumber },
      createdAt: new Date().toISOString(),
    };

    this.orders = [newOrder, ...this.orders];
    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    return newOrder;
  }

  purchaseCableTV(provider: string, iucNumber: string, bouquetName: string, amount: number): Order {
    if (this.wallet.currentBalance < amount) {
      throw new Error("Insufficient wallet balance. Please fund your wallet.");
    }
    this.wallet.currentBalance -= amount;
    this.wallet.ledgerBalance -= amount;

    const orderNum = `HT-CBL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      userId: this.user.id,
      userName: this.user.fullName,
      userEmail: this.user.email,
      userPhone: this.user.phone,
      serviceCategorySlug: "utility-bills",
      serviceCategoryName: "Utility & Entertainment",
      serviceTitle: `${provider} (${bouquetName}) Smartcard ${iucNumber} - ₦${amount.toLocaleString()}`,
      status: "COMPLETED",
      paymentStatus: "PAID",
      paymentMethod: "WALLET",
      totalAmount: amount,
      feeAmount: 0,
      currency: "NGN",
      items: [{ title: `${provider} ${bouquetName} to ${iucNumber}`, quantity: 1, unitPrice: amount, serviceId: bouquetName }],
      statusTimeline: [
        { status: "PENDING", timestamp: new Date().toISOString(), note: "Order placed" },
        { status: "PROCESSING", timestamp: new Date().toISOString(), note: `Broadcasting activation to ${provider}` },
        { status: "COMPLETED", timestamp: new Date().toISOString(), note: "Bouquet renewed successfully" },
      ],
      deliveryType: "INSTANT_DIGITAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: orderNum,
      userId: this.user.id,
      userName: this.user.fullName,
      type: "CABLE_TV",
      amount,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: "WALLET",
      description: `${provider} Cable TV (${bouquetName}) Smartcard ${iucNumber}`,
      createdAt: new Date().toISOString(),
    };

    this.orders = [newOrder, ...this.orders];
    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    return newOrder;
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

  // --- Real API Server Integrations (M8 - Academy) ---
  async fetchCourses(): Promise<CourseRecord[]> {
    try {
      const res = await fetch("/api/academy/courses");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchCourses failed:", e);
    }
    return [];
  }

  async fetchCourseById(id: string): Promise<CourseRecord | null> {
    try {
      const res = await fetch(`/api/academy/courses/${id}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      console.error("fetchCourseById failed:", e);
    }
    return null;
  }

  async fetchInstructors(): Promise<InstructorRecord[]> {
    try {
      const res = await fetch("/api/academy/instructors");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchInstructors failed:", e);
    }
    return [];
  }

  async fetchRemoteEnrollments(userId?: string): Promise<AcademyEnrollment[]> {
    try {
      const url = userId ? `/api/academy/enrollments?userId=${userId}` : "/api/academy/enrollments";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchRemoteEnrollments failed:", e);
    }
    return this.enrollments;
  }

  async enrollCourseRemote(courseId: string, options?: { payWithWallet?: boolean; studentPhone?: string; cohort?: string }): Promise<any> {
    const res = await fetch("/api/academy/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, ...options }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Enrollment failed");
    }
    return json.data;
  }

  async updateLessonProgress(enrollmentId: string, lessonId: string, moduleId: number): Promise<AcademyEnrollment> {
    const res = await fetch("/api/academy/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId, lessonId, moduleId }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to update lesson progress");
    }
    return json.data;
  }

  async fetchAssignments(courseId?: string): Promise<CourseAssignmentRecord[]> {
    try {
      const url = courseId ? `/api/academy/assignments?courseId=${courseId}` : "/api/academy/assignments";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchAssignments failed:", e);
    }
    return [];
  }

  async submitAssignmentRemote(payload: { assignmentId: string; enrollmentId: string; content: string; fileUrl?: string }): Promise<AssignmentSubmissionRecord> {
    const res = await fetch("/api/academy/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to submit assignment");
    }
    return json.data;
  }

  async fetchCertificates(): Promise<CertificateRecord[]> {
    try {
      const res = await fetch("/api/academy/certificates");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchCertificates failed:", e);
    }
    return [];
  }

  async verifyCertificateRemote(code: string): Promise<CertificateVerificationResult> {
    const res = await fetch(`/api/academy/verify/${encodeURIComponent(code)}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Verification request failed");
    }
    return json.data;
  }

  async fetchIdCards(): Promise<StudentIdCardRecord[]> {
    try {
      const res = await fetch("/api/academy/id-cards");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchIdCards failed:", e);
    }
    return [];
  }

  // --- Real API Server Integrations (M9 - Shop) ---
  async fetchProductCategories(): Promise<ProductCategoryRecord[]> {
    try {
      const res = await fetch("/api/shop/categories");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchProductCategories failed:", e);
    }
    return [];
  }

  async fetchProducts(categoryId?: string, query?: string): Promise<ProductRecord[]> {
    try {
      let url = "/api/shop/products";
      const params = new URLSearchParams();
      if (categoryId) params.set("categoryId", categoryId);
      if (query) params.set("q", query);
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchProducts failed:", e);
    }
    return [];
  }

  async fetchProductById(id: string): Promise<ProductRecord | null> {
    try {
      const res = await fetch(`/api/shop/products/${id}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      console.error("fetchProductById failed:", e);
    }
    return null;
  }

  async fetchDeliveryZones(): Promise<DeliveryZoneRecord[]> {
    try {
      const res = await fetch("/api/shop/delivery-zones");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchDeliveryZones failed:", e);
    }
    return [];
  }

  async createShopOrderRemote(payload: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryZoneId: string;
    deliveryAddress?: string;
    paymentMethod?: "WALLET" | "PAYSTACK" | "MONIEPOINT" | "BANK_TRANSFER";
    notes?: string;
  }): Promise<Order> {
    const res = await fetch("/api/shop/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to place shop order");
    }
    return json.data;
  }

  async fetchShopOrders(): Promise<Order[]> {
    try {
      const res = await fetch("/api/shop/orders");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchShopOrders failed:", e);
    }
    return [];
  }

  async fetchInventoryLogs(productId?: string): Promise<ProductInventoryLogRecord[]> {
    try {
      const url = productId ? `/api/shop/inventory?productId=${productId}` : "/api/shop/inventory";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchInventoryLogs failed:", e);
    }
    return [];
  }

  async adjustStockRemote(
    productIdOrPayload: string | { productId: string; type?: string; changeType?: string; quantity: number; note?: string; notes?: string },
    changeType?: string,
    quantity?: number,
    notes?: string
  ): Promise<ProductRecord> {
    let bodyPayload: { productId: string; changeType: string; quantity: number; notes?: string };
    if (typeof productIdOrPayload === "object") {
      bodyPayload = {
        productId: productIdOrPayload.productId,
        changeType: productIdOrPayload.type || productIdOrPayload.changeType || "ADJUSTMENT",
        quantity: productIdOrPayload.quantity,
        notes: productIdOrPayload.note || productIdOrPayload.notes,
      };
    } else {
      bodyPayload = {
        productId: productIdOrPayload,
        changeType: changeType || "ADJUSTMENT",
        quantity: quantity || 0,
        notes,
      };
    }

    const res = await fetch("/api/shop/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to adjust stock");
    }
    return json.data;
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

  createTicket(params: {
    category: SupportTicket["category"] | string;
    subject: string;
    priority: SupportTicket["priority"] | string;
    message: string;
  }): SupportTicket {
    return this.createSupportTicket({
      category: params.category as SupportTicket["category"],
      subject: params.subject,
      priority: params.priority as SupportTicket["priority"],
      initialMessage: params.message,
    });
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

  // --- User Management ---
  getUsers(filter?: { role?: string; status?: string; search?: string }): User[] {
    let list = [...this.users];
    if (filter?.role && filter.role !== "ALL") {
      list = list.filter((u) => u.role === filter.role.toLowerCase());
    }
    if (filter?.status && filter.status !== "ALL") {
      list = list.filter((u) => u.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
      );
    }
    return list;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(data: Omit<User, "id" | "createdAt"> & { id?: string }): User {
    const newUser: User = {
      id: data.id || `usr-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.users = [newUser, ...this.users];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "USER", newUser.id, "SUCCESS", `Created user ${newUser.fullName} (${newUser.role})`);
    return newUser;
  }

  updateUser(id: string, data: Partial<User>): User | null {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...data };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "USER", id, "SUCCESS", `Updated user ${this.users[idx].fullName}`);
    return this.users[idx];
  }

  deleteUser(id: string): boolean {
    const target = this.users.find((u) => u.id === id);
    if (!target) return false;
    // Protect system master admin
    if (target.email === "admin@hambaktech.com.ng") {
      throw new Error("Cannot delete primary system administrator account.");
    }
    this.users = this.users.filter((u) => u.id !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "USER", id, "SUCCESS", `Deleted user ${target.fullName}`);
    return true;
  }

  updateUserStatus(id: string, status: UserStatus): User | null {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], status };
    this.saveToStorage();
    this.logAuditEvent("UPDATE_STATUS", "USER", id, "SUCCESS", `Changed status to ${status}`);
    return this.users[idx];
  }

  updateUserRole(id: string, role: RoleSlug): User | null {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], role };
    this.saveToStorage();
    this.logAuditEvent("UPDATE_ROLE", "USER", id, "SUCCESS", `Changed role to ${role}`);
    return this.users[idx];
  }

  // --- Services Management ---
  getServices(filter?: { status?: string; search?: string }): ServiceCategory[] {
    let list = [...this.services];
    if (filter?.status && filter.status !== "ALL") {
      list = list.filter((s) => s.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getServiceById(id: string): ServiceCategory | undefined {
    return this.services.find((s) => s.id === id || s.slug === id);
  }

  createService(data: Omit<ServiceCategory, "id"> & { id?: string }): ServiceCategory {
    const newService: ServiceCategory = {
      id: data.id || data.slug || `srv-${Date.now().toString(36)}`,
      ...data,
    };
    this.services = [...this.services, newService];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "SERVICE", newService.id, "SUCCESS", `Created service ${newService.title}`);
    return newService;
  }

  updateService(id: string, updates: Partial<ServiceCategory>): ServiceCategory | null {
    const idx = this.services.findIndex((s) => s.id === id || s.slug === id);
    if (idx === -1) return null;
    this.services[idx] = { ...this.services[idx], ...updates };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "SERVICE", id, "SUCCESS", `Updated service ${this.services[idx].title}`);
    return this.services[idx];
  }

  deleteService(id: string): boolean {
    const exists = this.services.find((s) => s.id === id || s.slug === id);
    if (!exists) return false;
    this.services = this.services.filter((s) => s.id !== id && s.slug !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "SERVICE", id, "SUCCESS", `Deleted service ${exists.title}`);
    return true;
  }

  toggleServiceStatus(id: string): ServiceCategory | null {
    const idx = this.services.findIndex((s) => s.id === id || s.slug === id);
    if (idx === -1) return null;
    const current = this.services[idx].status;
    const nextStatus = current === "available" ? "coming_soon" : "available";
    this.services[idx].status = nextStatus;
    this.saveToStorage();
    return this.services[idx];
  }

  toggleServiceFeatured(id: string): ServiceCategory | null {
    const idx = this.services.findIndex((s) => s.id === id || s.slug === id);
    if (idx === -1) return null;
    this.services[idx].featured = !this.services[idx].featured;
    this.saveToStorage();
    return this.services[idx];
  }

  // --- Service Categories Management ---
  getCategories(filter?: { status?: string; search?: string }): ServiceCategoryRecord[] {
    let list = [...this.categories];
    if (filter?.status && filter.status !== "ALL") {
      list = list.filter((c) => c.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getCategoryById(id: string): ServiceCategoryRecord | undefined {
    return this.categories.find((c) => c.id === id || c.code === id);
  }

  createCategory(data: Omit<ServiceCategoryRecord, "id"> & { id?: string }): ServiceCategoryRecord {
    const newCat: ServiceCategoryRecord = {
      id: data.id || `cat-${Date.now().toString(36)}`,
      ...data,
    };
    this.categories = [...this.categories, newCat];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "CATEGORY", newCat.id, "SUCCESS", `Created category ${newCat.name}`);
    return newCat;
  }

  updateCategory(id: string, updates: Partial<ServiceCategoryRecord>): ServiceCategoryRecord | null {
    const idx = this.categories.findIndex((c) => c.id === id || c.code === id);
    if (idx === -1) return null;
    this.categories[idx] = { ...this.categories[idx], ...updates };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "CATEGORY", id, "SUCCESS", `Updated category ${this.categories[idx].name}`);
    return this.categories[idx];
  }

  deleteCategory(id: string): boolean {
    const exists = this.categories.find((c) => c.id === id || c.code === id);
    if (!exists) return false;
    this.categories = this.categories.filter((c) => c.id !== id && c.code !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "CATEGORY", id, "SUCCESS", `Deleted category ${exists.name}`);
    return true;
  }

  toggleCategoryStatus(id: string): ServiceCategoryRecord | null {
    const idx = this.categories.findIndex((c) => c.id === id || c.code === id);
    if (idx === -1) return null;
    this.categories[idx].status = this.categories[idx].status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    this.saveToStorage();
    return this.categories[idx];
  }

  // --- Orders Management ---
  createManualOrder(orderData: Partial<Order>): Order {
    const orderNum = `HT-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      id: orderData.id || `ord-${Date.now().toString(36)}`,
      orderNumber: orderNum,
      userId: orderData.userId || this.user.id,
      userName: orderData.userName || this.user.fullName,
      userEmail: orderData.userEmail || this.user.email,
      userPhone: orderData.userPhone || this.user.phone,
      serviceCategorySlug: orderData.serviceCategorySlug || "general",
      serviceCategoryName: orderData.serviceCategoryName || "General Service",
      serviceTitle: orderData.serviceTitle || "Custom Service Request",
      status: orderData.status || "PROCESSING",
      paymentStatus: orderData.paymentStatus || "PAID",
      paymentMethod: orderData.paymentMethod || "MANUAL_ADMIN",
      totalAmount: orderData.totalAmount || 0,
      feeAmount: orderData.feeAmount || 0,
      currency: "NGN",
      items: orderData.items || [
        {
          title: orderData.serviceTitle || "Manual Admin Order",
          quantity: 1,
          unitPrice: orderData.totalAmount || 0,
        },
      ],
      statusTimeline: [
        {
          status: orderData.status || "PROCESSING",
          timestamp: now,
          note: orderData.notes || "Order logged manually by HambakTech Administrator.",
        },
      ],
      notes: orderData.notes,
      deliveryType: orderData.deliveryType || "PHYSICAL_PICKUP",
      createdAt: now,
      updatedAt: now,
    };

    this.orders = [newOrder, ...this.orders];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "ORDER", newOrder.id, "SUCCESS", `Created manual order ${orderNum}`);
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const idx = this.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) return null;
    const oldOrder = this.orders[idx];
    const now = new Date().toISOString();
    
    // If status changed, push to timeline
    const timeline = [...(oldOrder.statusTimeline || [])];
    if (updates.status && updates.status !== oldOrder.status) {
      timeline.push({
        status: updates.status,
        timestamp: now,
        note: updates.notes || `Order status updated to ${updates.status} by Admin`,
      });
    }

    this.orders[idx] = {
      ...oldOrder,
      ...updates,
      statusTimeline: timeline,
      updatedAt: now,
    };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "ORDER", id, "SUCCESS", `Updated order ${oldOrder.orderNumber}`);
    return this.orders[idx];
  }

  deleteOrder(id: string): boolean {
    const exists = this.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!exists) return false;
    this.orders = this.orders.filter((o) => o.id !== id && o.orderNumber !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "ORDER", id, "SUCCESS", `Deleted order ${exists.orderNumber}`);
    return true;
  }

  // --- Transactions Management ---
  createTransaction(tx: Omit<Transaction, "id" | "createdAt"> & { id?: string; createdAt?: string }): Transaction {
    const newTx: Transaction = {
      id: tx.id || `tx-${Date.now().toString(36)}`,
      reference: tx.reference || `HT-TX-${Date.now().toString(36).toUpperCase()}`,
      createdAt: tx.createdAt || new Date().toISOString(),
      ...tx,
    };
    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "TRANSACTION", newTx.id, "SUCCESS", `Recorded transaction ${newTx.reference}`);
    return newTx;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const idx = this.transactions.findIndex((t) => t.id === id || t.reference === id);
    if (idx === -1) return null;
    this.transactions[idx] = { ...this.transactions[idx], ...updates };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "TRANSACTION", id, "SUCCESS", `Updated transaction ${this.transactions[idx].reference}`);
    return this.transactions[idx];
  }

  deleteTransaction(id: string): boolean {
    const exists = this.transactions.find((t) => t.id === id || t.reference === id);
    if (!exists) return false;
    this.transactions = this.transactions.filter((t) => t.id !== id && t.reference !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "TRANSACTION", id, "SUCCESS", `Voided transaction ${exists.reference}`);
    return true;
  }

  resetWalletBalance(userId: string): boolean {
    if (userId === this.user.id || userId === this.wallet.userId) {
      this.wallet.currentBalance = 0;
      this.wallet.ledgerBalance = 0;
      this.wallet.updatedAt = new Date().toISOString();
      this.saveToStorage();
      this.logAuditEvent("RESET", "WALLET", userId, "SUCCESS", "Zeroed out wallet balance");
      return true;
    }
    this.logAuditEvent("RESET", "WALLET", userId, "SUCCESS", "Reset external user wallet to zero");
    return true;
  }

  // --- Dynamic Pricing Rules ---
  createPriceRule(rule: Omit<PriceRule, "id"> & { id?: string }): PriceRule {
    const newRule: PriceRule = {
      id: rule.id || `pr-${Date.now().toString(36)}`,
      ...rule,
    };
    this.priceRules = [...this.priceRules, newRule];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "PRICE_RULE", newRule.id, "SUCCESS", `Created pricing rule for ${newRule.serviceName}`);
    return newRule;
  }

  deletePriceRule(id: string): boolean {
    const exists = this.priceRules.find((p) => p.id === id);
    if (!exists) return false;
    this.priceRules = this.priceRules.filter((p) => p.id !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "PRICE_RULE", id, "SUCCESS", `Removed pricing rule ${exists.serviceName}`);
    return true;
  }

  // --- System Providers ---
  createProvider(prov: Omit<SystemProvider, "id"> & { id?: string }): SystemProvider {
    const newProv: SystemProvider = {
      id: prov.id || `prov-${Date.now().toString(36)}`,
      ...prov,
    };
    this.providers = [...this.providers, newProv];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "PROVIDER", newProv.id, "SUCCESS", `Registered provider ${newProv.name}`);
    return newProv;
  }

  updateProvider(codeOrId: string, updates: Partial<SystemProvider>): SystemProvider | null {
    const idx = this.providers.findIndex((p) => p.code === codeOrId || p.id === codeOrId);
    if (idx === -1) return null;
    this.providers[idx] = { ...this.providers[idx], ...updates };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "PROVIDER", codeOrId, "SUCCESS", `Updated provider ${this.providers[idx].name}`);
    return this.providers[idx];
  }

  deleteProvider(codeOrId: string): boolean {
    const exists = this.providers.find((p) => p.code === codeOrId || p.id === codeOrId);
    if (!exists) return false;
    this.providers = this.providers.filter((p) => p.code !== codeOrId && p.id !== codeOrId);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "PROVIDER", codeOrId, "SUCCESS", `Deleted provider ${exists.name}`);
    return true;
  }

  // --- NIN Requests Management ---
  updateNINRequest(id: string, updates: Partial<NINRequest>): NINRequest | null {
    const idx = this.ninRequests.findIndex((r) => r.id === id || r.trackingNumber === id);
    if (idx === -1) return null;
    this.ninRequests[idx] = { ...this.ninRequests[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "NIN_REQUEST", id, "SUCCESS", `Updated NIN request ${this.ninRequests[idx].trackingNumber}`);
    return this.ninRequests[idx];
  }

  deleteNINRequest(id: string): boolean {
    const exists = this.ninRequests.find((r) => r.id === id || r.trackingNumber === id);
    if (!exists) return false;
    this.ninRequests = this.ninRequests.filter((r) => r.id !== id && r.trackingNumber !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "NIN_REQUEST", id, "SUCCESS", `Deleted NIN request ${exists.trackingNumber}`);
    return true;
  }

  // --- CAC Requests Management ---
  updateCACRequest(id: string, updates: Partial<CACRequest>): CACRequest | null {
    const idx = this.cacRequests.findIndex((r) => r.id === id || r.trackingNumber === id);
    if (idx === -1) return null;
    this.cacRequests[idx] = { ...this.cacRequests[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "CAC_REQUEST", id, "SUCCESS", `Updated CAC request ${this.cacRequests[idx].trackingNumber}`);
    return this.cacRequests[idx];
  }

  deleteCACRequest(id: string): boolean {
    const exists = this.cacRequests.find((r) => r.id === id || r.trackingNumber === id);
    if (!exists) return false;
    this.cacRequests = this.cacRequests.filter((r) => r.id !== id && r.trackingNumber !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "CAC_REQUEST", id, "SUCCESS", `Deleted CAC request ${exists.trackingNumber}`);
    return true;
  }

  // --- Academy Enrollments Management ---
  createAcademyEnrollment(enr: Partial<AcademyEnrollment>): AcademyEnrollment {
    const newEnr: AcademyEnrollment = {
      id: enr.id || `enr-${Date.now().toString(36)}`,
      userId: enr.userId || this.user.id,
      courseId: enr.courseId || "course-web-01",
      courseTitle: enr.courseTitle || "Professional Web Development",
      studentName: enr.studentName || this.user.fullName,
      studentEmail: enr.studentEmail || this.user.email,
      cohort: enr.cohort || "Q4-2026",
      progressPercent: enr.progressPercent || 0,
      status: enr.status || "ENROLLED",
      completedModules: enr.completedModules || [],
      certificateIssued: enr.certificateIssued || false,
      certificateNumber: enr.certificateNumber,
      certificateDate: enr.certificateDate,
      enrolledAt: enr.enrolledAt || new Date().toISOString(),
    };
    this.enrollments = [newEnr, ...this.enrollments];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "ACADEMY", newEnr.id, "SUCCESS", `Enrolled ${newEnr.studentName} in ${newEnr.courseTitle}`);
    return newEnr;
  }

  updateAcademyEnrollment(id: string, updates: Partial<AcademyEnrollment>): AcademyEnrollment | null {
    const idx = this.enrollments.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.enrollments[idx] = { ...this.enrollments[idx], ...updates };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "ACADEMY", id, "SUCCESS", `Updated student ${this.enrollments[idx].studentName}`);
    return this.enrollments[idx];
  }

  deleteAcademyEnrollment(id: string): boolean {
    const exists = this.enrollments.find((e) => e.id === id);
    if (!exists) return false;
    this.enrollments = this.enrollments.filter((e) => e.id !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "ACADEMY", id, "SUCCESS", `Removed enrollment for ${exists.studentName}`);
    return true;
  }

  // --- Support Tickets Management ---
  updateTicket(id: string, updates: Partial<SupportTicket>): SupportTicket | null {
    const idx = this.tickets.findIndex((t) => t.id === id || t.ticketNumber === id);
    if (idx === -1) return null;
    this.tickets[idx] = { ...this.tickets[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "SUPPORT_TICKET", id, "SUCCESS", `Updated ticket ${this.tickets[idx].ticketNumber}`);
    return this.tickets[idx];
  }

  deleteTicket(id: string): boolean {
    const exists = this.tickets.find((t) => t.id === id || t.ticketNumber === id);
    if (!exists) return false;
    this.tickets = this.tickets.filter((t) => t.id !== id && t.ticketNumber !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "SUPPORT_TICKET", id, "SUCCESS", `Deleted ticket ${exists.ticketNumber}`);
    return true;
  }

  // --- CMS Content Management (Announcements, Pages, BlogPosts) ---
  updateAnnouncement(id: string, updates: Partial<CMSAnnouncement>): CMSAnnouncement | null {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.announcements[idx] = { ...this.announcements[idx], ...updates };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "ANNOUNCEMENT", id, "SUCCESS", `Updated announcement ${this.announcements[idx].title}`);
    return this.announcements[idx];
  }

  createCMSPage(page: Omit<CMSPage, "id" | "updatedAt"> & { id?: string }): CMSPage {
    const newPage: CMSPage = {
      id: page.id || `pg-${Date.now().toString(36)}`,
      updatedAt: new Date().toISOString(),
      ...page,
    };
    this.cmsPages = [...this.cmsPages, newPage];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "CMS_PAGE", newPage.id, "SUCCESS", `Created page /${newPage.slug}`);
    return newPage;
  }

  updateCMSPage(id: string, updates: Partial<CMSPage>): CMSPage | null {
    const idx = this.cmsPages.findIndex((p) => p.id === id || p.slug === id);
    if (idx === -1) return null;
    this.cmsPages[idx] = { ...this.cmsPages[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "CMS_PAGE", id, "SUCCESS", `Updated page /${this.cmsPages[idx].slug}`);
    return this.cmsPages[idx];
  }

  deleteCMSPage(id: string): boolean {
    const exists = this.cmsPages.find((p) => p.id === id || p.slug === id);
    if (!exists) return false;
    this.cmsPages = this.cmsPages.filter((p) => p.id !== id && p.slug !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "CMS_PAGE", id, "SUCCESS", `Deleted page /${exists.slug}`);
    return true;
  }

  createBlogPost(post: Omit<BlogPost, "id" | "publishedAt"> & { id?: string }): BlogPost {
    const newPost: BlogPost = {
      id: post.id || `post-${Date.now().toString(36)}`,
      publishedAt: new Date().toISOString(),
      ...post,
    };
    this.blogPosts = [newPost, ...this.blogPosts];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "BLOG_POST", newPost.id, "SUCCESS", `Published article ${newPost.title}`);
    return newPost;
  }

  updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
    const idx = this.blogPosts.findIndex((b) => b.id === id || b.slug === id);
    if (idx === -1) return null;
    this.blogPosts[idx] = { ...this.blogPosts[idx], ...updates };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "BLOG_POST", id, "SUCCESS", `Updated article ${this.blogPosts[idx].title}`);
    return this.blogPosts[idx];
  }

  deleteBlogPost(id: string): boolean {
    const exists = this.blogPosts.find((b) => b.id === id || b.slug === id);
    if (!exists) return false;
    this.blogPosts = this.blogPosts.filter((b) => b.id !== id && b.slug !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "BLOG_POST", id, "SUCCESS", `Deleted article ${exists.title}`);
    return true;
  }

  // --- Notifications Management ---
  updateNotification(id: string, updates: Partial<NotificationItem>): NotificationItem | null {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    this.notifications[idx] = { ...this.notifications[idx], ...updates };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "NOTIFICATION", id, "SUCCESS", `Updated notification "${this.notifications[idx].title}"`);
    return this.notifications[idx];
  }

  deleteNotification(id: string): boolean {
    const exists = this.notifications.find((n) => n.id === id);
    if (!exists) return false;
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "NOTIFICATION", id, "SUCCESS", `Deleted notification "${exists.title}"`);
    return true;
  }

  // --- Payment Attempts Management ---
  createPaymentAttempt(attempt: Omit<PaymentAttempt, "id" | "createdAt"> & { id?: string }): PaymentAttempt {
    const newAttempt: PaymentAttempt = {
      id: attempt.id || `pay-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      ...attempt,
    };
    this.paymentAttempts = [newAttempt, ...this.paymentAttempts];
    this.saveToStorage();
    this.logAuditEvent("CREATE", "PAYMENT_ATTEMPT", newAttempt.id, "SUCCESS", `Logged payment attempt ref ${newAttempt.reference}`);
    return newAttempt;
  }

  updatePaymentAttempt(id: string, updates: Partial<PaymentAttempt>): PaymentAttempt | null {
    const idx = this.paymentAttempts.findIndex((p) => p.id === id || p.reference === id);
    if (idx === -1) return null;
    this.paymentAttempts[idx] = { ...this.paymentAttempts[idx], ...updates };
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "PAYMENT_ATTEMPT", id, "SUCCESS", `Updated payment attempt ref ${this.paymentAttempts[idx].reference}`);
    return this.paymentAttempts[idx];
  }

  deletePaymentAttempt(id: string): boolean {
    const exists = this.paymentAttempts.find((p) => p.id === id || p.reference === id);
    if (!exists) return false;
    this.paymentAttempts = this.paymentAttempts.filter((p) => p.id !== id && p.reference !== id);
    this.saveToStorage();
    this.logAuditEvent("DELETE", "PAYMENT_ATTEMPT", id, "SUCCESS", `Deleted payment attempt ref ${exists.reference}`);
    return true;
  }

  // --- Security & Audit Logs ---
  logAuditEvent(action: string, entity: string, entityId: string, status: "SUCCESS" | "FAILED" = "SUCCESS", notes?: string): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actorName: this.user.fullName || "Hambak Admin",
      actorEmail: this.user.email || "admin@hambaktech.com.ng",
      role: (this.user.role as RoleSlug) || "admin",
      action,
      entity,
      entityId,
      ipAddress: "102.89.44.12",
      status,
      metadata: notes ? { notes } : undefined,
    };
    this.auditLogs = [entry, ...this.auditLogs];
    this.saveToStorage();
    return entry;
  }

  createAuditLogEntry(entryData: Omit<AuditLogEntry, "id" | "timestamp"> & { id?: string; timestamp?: string }): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: entryData.id || `aud-${Date.now().toString(36)}`,
      timestamp: entryData.timestamp || new Date().toISOString(),
      ...entryData,
    };
    this.auditLogs = [entry, ...this.auditLogs];
    this.saveToStorage();
    return entry;
  }

  updateAuditLog(id: string, updates: Partial<AuditLogEntry>): AuditLogEntry | null {
    const idx = this.auditLogs.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.auditLogs[idx] = { ...this.auditLogs[idx], ...updates };
    this.saveToStorage();
    return this.auditLogs[idx];
  }

  deleteAuditLog(id: string): boolean {
    this.auditLogs = this.auditLogs.filter((a) => a.id !== id);
    this.saveToStorage();
    return true;
  }

  clearAuditLogs(): void {
    this.auditLogs = [];
    this.saveToStorage();
  }

  // --- Admin Wallets & Adjustments ---
  getAllWallets(): Array<{ wallet: Wallet; user: User }> {
    return this.users.map((u) => {
      let w: Wallet;
      if (u.id === this.user.id) {
        w = this.wallet;
      } else if (this.userWallets[u.id]) {
        w = this.userWallets[u.id];
      } else {
        w = {
          id: `wal-${u.id}`,
          userId: u.id,
          currency: "NGN",
          currentBalance: u.role === "agent" ? 125000 : u.role === "staff" ? 8400 : 15200,
          ledgerBalance: u.role === "agent" ? 125000 : u.role === "staff" ? 8400 : 15200,
          lockedBalance: 0,
          status: "ACTIVE",
          updatedAt: new Date().toISOString(),
        };
        this.userWallets[u.id] = w;
      }
      return { user: u, wallet: w };
    });
  }

  updateWalletStatus(userId: string, status: "ACTIVE" | "FROZEN" | "SUSPENDED"): Wallet {
    if (userId === this.user.id || userId === this.wallet.userId) {
      this.wallet.status = status;
      this.wallet.updatedAt = new Date().toISOString();
      this.saveToStorage();
      this.logAuditEvent("UPDATE", "WALLET", this.wallet.id, "SUCCESS", `Updated current user wallet status to ${status}`);
      return this.wallet;
    }

    if (!this.userWallets[userId]) {
      this.getAllWallets(); // ensures initialized
    }
    const w = this.userWallets[userId] || {
      id: `wal-${userId}`,
      userId,
      currency: "NGN",
      currentBalance: 10000,
      ledgerBalance: 10000,
      lockedBalance: 0,
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    };
    w.status = status;
    w.updatedAt = new Date().toISOString();
    this.userWallets[userId] = w;
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "WALLET", w.id, "SUCCESS", `Updated wallet status for user ${userId} to ${status}`);
    return w;
  }

  adjustWalletBalance(userId: string, amount: number, type: "CREDIT" | "DEBIT", reason: string): Transaction {
    const isTargetCurrentUser = userId === this.user.id || userId === this.wallet.userId;
    const delta = type === "CREDIT" ? amount : -amount;
    
    if (isTargetCurrentUser) {
      this.wallet.currentBalance = Math.max(0, this.wallet.currentBalance + delta);
      this.wallet.ledgerBalance = Math.max(0, this.wallet.ledgerBalance + delta);
      this.wallet.updatedAt = new Date().toISOString();
    } else {
      if (!this.userWallets[userId]) {
        this.getAllWallets();
      }
      if (this.userWallets[userId]) {
        this.userWallets[userId].currentBalance = Math.max(0, this.userWallets[userId].currentBalance + delta);
        this.userWallets[userId].ledgerBalance = Math.max(0, this.userWallets[userId].ledgerBalance + delta);
        this.userWallets[userId].updatedAt = new Date().toISOString();
      }
    }

    const ref = `HT-ADJ-${Date.now()}`;
    const targetUser = this.users.find((u) => u.id === userId) || this.user;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      userId: targetUser.id,
      userName: targetUser.fullName,
      type: "WALLET_TOPUP",
      amount,
      fee: 0,
      currency: "NGN",
      status: "SUCCESSFUL",
      paymentMethod: "WALLET",
      description: `Admin Adjustment (${type}): ${reason}`,
      createdAt: new Date().toISOString(),
    };

    this.transactions = [newTx, ...this.transactions];
    this.saveToStorage();
    this.logAuditEvent("UPDATE", "WALLET_BALANCE", userId, "SUCCESS", `Adjusted balance by ${type === "CREDIT" ? "+" : "-"}${amount}: ${reason}`);
    return newTx;
  }

  // --- Payment Gateways Logs ---
  getPaymentAttempts(filter?: { gateway?: string; status?: string; search?: string }): PaymentAttempt[] {
    let list = [...this.paymentAttempts];
    if (filter?.gateway && filter.gateway !== "ALL") {
      list = list.filter((p) => p.gateway === filter.gateway);
    }
    if (filter?.status && filter.status !== "ALL") {
      list = list.filter((p) => p.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.reference.toLowerCase().includes(q) ||
          p.customerEmail.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q)
      );
    }
    return list;
  }

  verifyPaymentAttempt(reference: string): PaymentAttempt | undefined {
    const attempt = this.paymentAttempts.find((p) => p.reference === reference);
    if (attempt && attempt.status === "PENDING") {
      attempt.status = "SUCCESS";
      attempt.gatewayResponse = "Re-queried and verified successfully with provider";
      this.saveToStorage();
    }
    return attempt;
  }

  // --- CMS Content ---
  getCMSPages(): CMSPage[] {
    return this.cmsPages;
  }

  getBlogPosts(): BlogPost[] {
    return this.blogPosts;
  }

  createAnnouncement(title: string, message: string, category: CMSAnnouncement["category"]): CMSAnnouncement {
    const item: CMSAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      message,
      category,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.announcements = [item, ...this.announcements];
    this.saveToStorage();
    return item;
  }

  toggleAnnouncement(id: string, active: boolean): void {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.announcements[idx].isActive = active;
      this.saveToStorage();
    }
  }

  deleteAnnouncement(id: string): void {
    this.announcements = this.announcements.filter((a) => a.id !== id);
    this.saveToStorage();
  }

  broadcastNotification(title: string, message: string, type: NotificationItem["type"], actionUrl?: string): NotificationItem {
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl,
    };
    this.notifications = [item, ...this.notifications];
    this.saveToStorage();
    return item;
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

  // --- Real API Server Integrations (M10 - Admin) ---
  async fetchAdminPricing(): Promise<PriceRule[]> {
    try {
      const res = await fetch("/api/admin/pricing");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchAdminPricing failed:", e);
    }
    return this.priceRules;
  }

  async updateAdminPriceRule(rule: Partial<PriceRule> & { id: string }): Promise<PriceRule> {
    const res = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rule),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to update price rule");
    }
    return json.data;
  }

  async fetchAdminOrders(): Promise<Order[]> {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchAdminOrders failed:", e);
    }
    return this.orders;
  }

  async updateAdminOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order> {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, note }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to update order status");
    }
    return json.data;
  }

  async fetchAdminUsers(): Promise<User[]> {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchAdminUsers failed:", e);
    }
    return this.users;
  }

  async updateAdminUser(userId: string, updates: Partial<User>): Promise<User> {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to update user");
    }
    return json.data;
  }

  async fetchAdminWallets(): Promise<Wallet[]> {
    try {
      const res = await fetch("/api/admin/wallets");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchAdminWallets failed:", e);
    }
    return [this.wallet];
  }

  async adjustAdminWallet(userId: string, amount: number, type: "CREDIT" | "DEBIT", description: string): Promise<Wallet> {
    const res = await fetch("/api/admin/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount, type, description }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to adjust wallet balance");
    }
    return json.data;
  }

  async fetchAdminProviders(): Promise<SystemProvider[]> {
    try {
      const res = await fetch("/api/admin/providers");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchAdminProviders failed:", e);
    }
    return this.providers;
  }

  async fetchAdminAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("fetchAdminAuditLogs failed:", e);
    }
    return this.auditLogs;
  }

  async fetchAdminReports(): Promise<any> {
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.error("fetchAdminReports failed:", e);
    }
    return this.getReportMetrics();
  }

  async fetchAdminSettings(): Promise<any> {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.error("fetchAdminSettings failed:", e);
    }
    return null;
  }

  async updateAdminSettings(updates: any): Promise<any> {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to update settings");
    }
    return json.data;
  }
}

export const platformApi = new PlatformStore();
export default platformApi;
