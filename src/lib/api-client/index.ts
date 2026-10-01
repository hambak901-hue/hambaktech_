"use client";

/**
 * ============================================================================
 * HAMBAKTECH PRODUCTION HTTP API CLIENT
 * ============================================================================
 * Thin HTTP API client for production frontend calls.
 * All authoritative business data resides in MySQL via the PHP REST API.
 * No business data is authoritative in memory or localStorage.
 * ============================================================================
 */

import {
  CourseRecord,
  AcademyEnrollment,
  InstructorRecord,
  CourseAssignmentRecord,
  AssignmentSubmissionRecord,
  CertificateRecord,
  StudentIdCardRecord,
  CertificateVerificationResult,
  ProductCategoryRecord,
  ProductRecord,
  DeliveryZoneRecord,
  ProductInventoryLogRecord,
  Order,
} from "@/types/platform";
import { getApiUrl } from "@/lib/api-config";
import { getAuthHeaders } from "@/lib/auth-token";

class PlatformApiClient {
  // ==========================================
  // ACADEMY API WRAPPERS
  // ==========================================

  async fetchCourses(): Promise<CourseRecord[]> {
    try {
      const res = await fetch(getApiUrl("/api/academy/courses"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchCourses failed:", e);
    }
    return [];
  }

  async fetchCourseById(id: string): Promise<CourseRecord | null> {
    try {
      const res = await fetch(getApiUrl(`/api/academy/courses/${encodeURIComponent(id)}`), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      console.error("[ApiClient] fetchCourseById failed:", e);
    }
    return null;
  }

  async fetchInstructors(): Promise<InstructorRecord[]> {
    try {
      const res = await fetch(getApiUrl("/api/academy/instructors"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchInstructors failed:", e);
    }
    return [];
  }

  async fetchRemoteEnrollments(userId?: string): Promise<AcademyEnrollment[]> {
    try {
      const url = userId
        ? `/api/academy/enrollments?userId=${encodeURIComponent(userId)}`
        : "/api/academy/enrollments";
      const res = await fetch(getApiUrl(url), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchRemoteEnrollments failed:", e);
    }
    return [];
  }

  async enrollCourseRemote(
    courseId: string,
    options?: { payWithWallet?: boolean; studentPhone?: string; cohort?: string }
  ): Promise<any> {
    const res = await fetch(getApiUrl("/api/academy/enrollments"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ courseId, ...options }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Enrollment failed");
    }
    return json.data;
  }

  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    moduleId: number
  ): Promise<AcademyEnrollment> {
    const res = await fetch(getApiUrl("/api/academy/progress"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
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
      const url = courseId
        ? `/api/academy/assignments?courseId=${encodeURIComponent(courseId)}`
        : "/api/academy/assignments";
      const res = await fetch(getApiUrl(url), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchAssignments failed:", e);
    }
    return [];
  }

  async submitAssignmentRemote(payload: {
    assignmentId: string;
    enrollmentId: string;
    content: string;
    fileUrl?: string;
  }): Promise<AssignmentSubmissionRecord> {
    const res = await fetch(getApiUrl("/api/academy/assignments"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
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
      const res = await fetch(getApiUrl("/api/academy/certificates"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchCertificates failed:", e);
    }
    return [];
  }

  async verifyCertificateRemote(code: string): Promise<CertificateVerificationResult> {
    const res = await fetch(getApiUrl(`/api/academy/verify/${encodeURIComponent(code)}`), {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Verification request failed");
    }
    return json.data;
  }

  async fetchIdCards(): Promise<StudentIdCardRecord[]> {
    try {
      const res = await fetch(getApiUrl("/api/academy/id-cards"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchIdCards failed:", e);
    }
    return [];
  }

  // ==========================================
  // SHOP API WRAPPERS
  // ==========================================

  async fetchProductCategories(): Promise<ProductCategoryRecord[]> {
    try {
      const res = await fetch(getApiUrl("/api/shop/categories"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchProductCategories failed:", e);
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

      const res = await fetch(getApiUrl(url), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchProducts failed:", e);
    }
    return [];
  }

  async fetchProductById(id: string): Promise<ProductRecord | null> {
    try {
      const res = await fetch(getApiUrl(`/api/shop/products/${encodeURIComponent(id)}`), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      console.error("[ApiClient] fetchProductById failed:", e);
    }
    return null;
  }

  async fetchDeliveryZones(): Promise<DeliveryZoneRecord[]> {
    try {
      const res = await fetch(getApiUrl("/api/shop/delivery-zones"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchDeliveryZones failed:", e);
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
    const res = await fetch(getApiUrl("/api/shop/orders"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
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
      const res = await fetch(getApiUrl("/api/shop/orders"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchShopOrders failed:", e);
    }
    return [];
  }

  async fetchInventoryLogs(productId?: string): Promise<ProductInventoryLogRecord[]> {
    try {
      const url = productId
        ? `/api/shop/inventory?productId=${encodeURIComponent(productId)}`
        : "/api/shop/inventory";
      const res = await fetch(getApiUrl(url), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchInventoryLogs failed:", e);
    }
    return [];
  }

  // ==========================================
  // WALLET & PAYMENT API WRAPPERS (M5 FOUNDATION)
  // ==========================================

  async fetchWallet(): Promise<{
    id: string;
    userId: string;
    currency: string;
    currentBalance: number;
    ledgerBalance: number;
    lockedBalance: number;
    status: string;
    updatedAt: string;
  } | null> {
    try {
      const res = await fetch(getApiUrl("/api/wallet"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      console.error("[ApiClient] fetchWallet failed:", e);
    }
    return null;
  }

  async fetchWalletTransactions(): Promise<any[]> {
    try {
      const res = await fetch(getApiUrl("/api/wallet/transactions"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchWalletTransactions failed:", e);
    }
    return [];
  }

  async fetchWalletLedger(): Promise<any[]> {
    try {
      const res = await fetch(getApiUrl("/api/wallet/ledger"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] fetchWalletLedger failed:", e);
    }
    return [];
  }

  async initializeWalletFunding(payload: {
    amount: number;
    channel?: "PAYSTACK" | "FLUTTERWAVE" | "MONIEPOINT" | "BANK_TRANSFER";
    metadata?: Record<string, unknown>;
  }): Promise<{
    transactionId: string;
    reference: string;
    txReference: string;
    authorizationUrl?: string;
    amount: number;
    currency: string;
    channel: string;
    metadata: Record<string, unknown>;
  }> {
    const res = await fetch(getApiUrl("/api/wallet/fund/initialize"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to initialize wallet funding");
    }
    return json.data;
  }

  async verifyWalletFunding(reference: string): Promise<{
    status: "SUCCESSFUL" | "FAILED" | "PENDING";
    alreadySettled: boolean;
    reference: string;
    amount: number;
    wallet: any;
    message?: string;
  }> {
    const res = await fetch(getApiUrl("/api/wallet/fund/verify"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ reference }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Failed to verify wallet funding");
    }
    return json.data;
  }

  async reconcileMyWallet(): Promise<any> {
    try {
      const res = await fetch(getApiUrl("/api/wallet/reconcile"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      console.error("[ApiClient] reconcileMyWallet failed:", e);
    }
    return null;
  }

  // ==========================================
  // ADMIN WALLET & FINANCIAL OPERATIONS
  // ==========================================

  async adminListWallets(): Promise<any[]> {
    try {
      const res = await fetch(getApiUrl("/api/admin/wallets"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] adminListWallets failed:", e);
    }
    return [];
  }

  async adminAdjustWallet(payload: {
    userId: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
    reason: string;
  }): Promise<any> {
    const res = await fetch(getApiUrl("/api/admin/wallets/adjust"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Admin wallet adjustment failed");
    }
    return json.data;
  }

  async adminListTransactions(): Promise<any[]> {
    try {
      const res = await fetch(getApiUrl("/api/admin/transactions"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      console.error("[ApiClient] adminListTransactions failed:", e);
    }
    return [];
  }

  async adminRequeryTransaction(reference: string): Promise<any> {
    const res = await fetch(getApiUrl("/api/admin/transactions/requery"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ reference }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Transaction requery failed");
    }
    return json.data;
  }

  async adminReverseTransaction(payload: { reference: string; reason: string }): Promise<any> {
    const res = await fetch(getApiUrl("/api/admin/transactions/reverse"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || "Transaction reversal failed");
    }
    return json.data;
  }

  async adminReconcileWallets(): Promise<any> {
    try {
      const res = await fetch(getApiUrl("/api/admin/reconciliation"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      console.error("[ApiClient] adminReconcileWallets failed:", e);
    }
    return null;
  }
}

export const platformApi = new PlatformApiClient();
export default platformApi;
