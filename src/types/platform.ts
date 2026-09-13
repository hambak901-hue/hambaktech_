/**
 * Typed API Contracts & Business Domain Models for HambakTech Smart Digital Platform
 * 
 * Architected to be database-independent:
 * - Compatible with Next.js frontend
 * - Compatible with future PHP/Laravel REST API
 * - Compatible with MySQL (initial cPanel deployment) and PostgreSQL (future scale)
 */

export type RoleSlug = "customer" | "admin" | "agent" | "super_admin" | "instructor" | "staff";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  name?: string;
  role: RoleSlug;
  status: UserStatus;
  avatarUrl?: string;
  state?: string;
  lga?: string;
  address?: string;
  createdAt: string;
}

export type WalletStatus = "ACTIVE" | "FROZEN" | "SUSPENDED";

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  currentBalance: number;
  ledgerBalance: number;
  lockedBalance: number;
  status: WalletStatus;
  updatedAt: string;
}

export type LedgerEntryType = "CREDIT" | "DEBIT";

export interface WalletLedgerEntry {
  id: string;
  walletId: string;
  entryType: LedgerEntryType;
  amount: number;
  balanceAfter: number;
  referenceType: "WALLET_FUNDING" | "SERVICE_PURCHASE" | "ORDER_PAYMENT" | "REFUND" | "ADMIN_ADJUSTMENT";
  referenceId: string;
  description: string;
  createdAt: string;
}

export type TransactionType =
  | "WALLET_TOPUP"
  | "ORDER_PAYMENT"
  | "SERVICE_PAYMENT"
  | "SERVICE_PURCHASE"
  | "VTU_AIRTIME"
  | "VTU_DATA"
  | "ELECTRICITY_BILL"
  | "CABLE_TV"
  | "CAC_SERVICE"
  | "NIN_SERVICE"
  | "PRINTING_ORDER"
  | "ACADEMY_ENROLLMENT"
  | "BUSINESS_CENTRE"
  | "REFUND"
  | "FEE";

export type TransactionStatus = "PENDING" | "SUCCESSFUL" | "FAILED" | "REVERSED";

export interface Transaction {
  id: string;
  reference: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  walletId?: string;
  providerId?: string;
  providerCode?: string;
  type: TransactionType;
  amount: number;
  fee: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: "WALLET" | "PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT" | "BANK_TRANSFER" | "CASH";
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "AWAITING_INPUT"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "FAILED" | "REFUNDED";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  serviceCategorySlug: string;
  serviceCategoryName: string;
  serviceTitle: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  totalAmount: number;
  feeAmount: number;
  currency: string;
  items: Array<{
    title: string;
    quantity: number;
    unitPrice: number;
    serviceId?: string;
  }>;
  statusTimeline: Array<{
    status: OrderStatus;
    timestamp: string;
    note: string;
  }>;
  timeline?: Array<{
    status: OrderStatus | string;
    timestamp: string;
    note: string;
  }>;
  notes?: string;
  deliveryType: "INSTANT_DIGITAL" | "PHYSICAL_PICKUP" | "COURIER_DELIVERY" | "ONLINE_PORTAL";
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// VTU & Bills Specific Contracts
// --------------------------------------------------------------------------
export type TelecomNetwork = "MTN" | "AIRTEL" | "GLO" | "9MOBILE";
export type ElectricityDisco = "IKEDC" | "EKEDC" | "AEDC" | "IBEDC" | "EEDC" | "PHEDC" | "KEDCO";
export type CableTVProvider = "DSTV" | "GOTV" | "STARTIMES" | "SHOWMAX";

export interface VTUDataPlan {
  id: string;
  network: TelecomNetwork;
  name: string;
  volume: string;
  validity: string;
  price: number;
}

export interface CableTVPackage {
  id: string;
  provider: CableTVProvider;
  name: string;
  price: number;
  channelsCount: number;
}

// --------------------------------------------------------------------------
// NIN Centre Contracts
// --------------------------------------------------------------------------
export type NINServiceType =
  | "SLIP_RETRIEVAL"
  | "DATA_MODIFICATION"
  | "PLASTIC_ID_CARD"
  | "BVN_HARMONIZATION"
  | "PRE_ENROLLMENT_ASSISTANCE";

export type NINRequestStatus =
  | "SUBMITTED"
  | "DOCUMENT_VERIFICATION"
  | "PARTNER_PROCESSING"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "QUERY_ISSUED";

export interface NINRequest {
  id: string;
  trackingNumber: string; // HT-NIN-YYYY-XXXX
  referenceNumber?: string;
  userId?: string;
  applicantName: string;
  ninNumber?: string;
  phone: string;
  email: string;
  serviceType: NINServiceType;
  deliveryType?: "DIGITAL_DOWNLOAD" | "PHYSICAL_PICKUP";
  status: NINRequestStatus;
  notes?: string;
  submittedAt: string;
  createdAt?: string;
  updatedAt: string;
  pickupOffice: string;
}

// --------------------------------------------------------------------------
// CAC & Business Registration Contracts
// --------------------------------------------------------------------------
export type CACOrganizationType =
  | "BUSINESS_NAME"
  | "PRIVATE_LIMITED_COMPANY"
  | "INCORPORATED_TRUSTEE_NGO";

export type CACRequestStatus =
  | "DRAFT"
  | "NAME_RESERVATION"
  | "DOCUMENT_PREPARATION"
  | "SUBMITTED_TO_PORTAL"
  | "QUERIED"
  | "APPROVED_CERTIFICATE_READY"
  | "COMPLETED";

export interface CACRequest {
  id: string;
  trackingNumber: string; // HT-CAC-YYYY-XXXX
  referenceNumber?: string;
  userId?: string;
  entityType: CACOrganizationType;
  registrationType?: CACOrganizationType;
  proposedName1: string;
  proposedName2: string;
  natureOfBusiness: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  directorsCount: number;
  status: CACRequestStatus;
  portalSubmissionRef?: string;
  rcNumber?: string;
  tinNumber?: string;
  notes?: string;
  submittedAt: string;
  createdAt?: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// Academy Contracts
// --------------------------------------------------------------------------
export interface AcademyEnrollment {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  cohort: string;
  progressPercent: number;
  status: "ENROLLED" | "IN_PROGRESS" | "COMPLETED" | "DROPPED";
  completedModules: number[];
  certificateIssued: boolean;
  certificateNumber?: string;
  certificateDate?: string;
  enrolledAt: string;
}

// --------------------------------------------------------------------------
// Support Tickets Contracts
// --------------------------------------------------------------------------
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_ON_CUSTOMER" | "RESOLVED" | "CLOSED";
export type TicketCategory =
  | "WALLET"
  | "WALLET_FUNDING"
  | "VTU_BILLS"
  | "ORDERS"
  | "NIN_DESK"
  | "CAC_DESK"
  | "CAC_REGISTRATION"
  | "ACADEMY"
  | "PRINTING_CENTRE"
  | "TECHNICAL";

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: RoleSlug;
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // HT-TKT-XXXXX
  userId: string;
  userName: string;
  userEmail: string;
  category: TicketCategory;
  subject: string;
  message?: string;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// Admin & Pricing Contracts
// --------------------------------------------------------------------------
export interface PriceRule {
  id: string;
  serviceName: string;
  serviceCategory: string;
  provider: string;
  providerCost: number;
  sellingPrice: number;
  markupPercent: number;
  serviceFee: number;
  customerTier: "STANDARD" | "RESELLER" | "VIP";
  isActive: boolean;
  effectiveDate: string;
}

export interface SystemProvider {
  id: string;
  name: string;
  code: string;
  type: "PAYMENT_GATEWAY" | "TELECOM_VTU" | "UTILITY_DISCO" | "CABLE_TV" | "IDENTITY_PARTNER" | "SMS_GATEWAY";
  environment: "SANDBOX" | "PRODUCTION";
  isActive: boolean;
  successRate: number;
  balance?: number;
}

export interface CMSAnnouncement {
  id: string;
  title: string;
  message: string;
  category: "GENERAL" | "MAINTENANCE" | "PROMOTION" | "ALERT";
  isActive: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  role: RoleSlug;
  action: string;
  entity: string;
  entityId: string;
  ipAddress: string;
  status: "SUCCESS" | "FAILED" | "WARNING";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "TRANSACTION" | "ORDER" | "SECURITY" | "ANNOUNCEMENT" | "SYSTEM";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  published: boolean;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  publishedAt: string;
  featured: boolean;
}

export interface PaymentAttempt {
  id: string;
  reference: string;
  gateway: "PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT" | "BANK_TRANSFER";
  amount: number;
  currency: string;
  status: "INITIALIZED" | "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED";
  customerEmail: string;
  customerName: string;
  serviceType: string;
  channel?: string;
  gatewayResponse?: string;
  createdAt: string;
}

export interface PlatformReport {
  period: string;
  grossVolume: number;
  netRevenue: number;
  vtuSales: number;
  ninRegistrationsCount: number;
  cacFilingsCount: number;
  academyEnrollmentsCount: number;
  totalOrdersCount: number;
  successfulTxCount: number;
  failedTxCount: number;
}

