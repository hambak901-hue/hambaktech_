/**
 * Provider Adapter Interfaces and Dynamic Registry for HambakTech
 * Eliminates hardcoded provider integrations and standardizes third-party dispatch.
 */

export interface PaymentInitializationParams {
  reference: string;
  amount: number;
  currency: string;
  email: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitializationResult {
  paymentUrl: string;
  reference: string;
  gatewayReference?: string;
}

export interface PaymentVerificationResult {
  reference: string;
  amount: number;
  currency: string;
  status: "SUCCESSFUL" | "FAILED" | "PENDING";
  gatewayReference: string;
  paidAt?: Date;
  rawResponse?: unknown;
}

export interface PaymentGatewayAdapter {
  readonly code: string;
  initializePayment(params: PaymentInitializationParams): Promise<PaymentInitializationResult>;
  verifyPayment(reference: string): Promise<PaymentVerificationResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

export interface IdentityVerificationParams {
  idType: "NIN" | "BVN" | "CAC";
  idValue: string;
  consent: boolean;
}

export interface IdentityVerificationResult {
  verified: boolean;
  reference: string;
  status: "MATCH" | "NO_MATCH" | "ERROR";
  maskedDetails?: Record<string, string>;
}

export interface IdentityVerificationAdapter {
  readonly code: string;
  verifyIdentity(params: IdentityVerificationParams): Promise<IdentityVerificationResult>;
}

export interface TelecomPurchaseParams {
  network: "MTN" | "AIRTEL" | "GLO" | "9MOBILE";
  phone: string;
  type: "AIRTIME" | "DATA";
  amount?: number;
  planCode?: string;
}

export interface TelecomPurchaseResult {
  reference: string;
  status: "DELIVERED" | "PENDING" | "FAILED";
  operatorRef?: string;
}

export interface TelecomVtuAdapter {
  readonly code: string;
  purchase(params: TelecomPurchaseParams): Promise<TelecomPurchaseResult>;
}

/**
 * Dynamic Provider Registry
 */
export class ProviderRegistry {
  private static paymentAdapters = new Map<string, PaymentGatewayAdapter>();
  private static identityAdapters = new Map<string, IdentityVerificationAdapter>();
  private static telecomAdapters = new Map<string, TelecomVtuAdapter>();

  public static registerPaymentAdapter(adapter: PaymentGatewayAdapter): void {
    this.paymentAdapters.set(adapter.code.toUpperCase(), adapter);
  }

  public static getPaymentAdapter(code: string): PaymentGatewayAdapter | undefined {
    return this.paymentAdapters.get(code.toUpperCase());
  }

  public static registerIdentityAdapter(adapter: IdentityVerificationAdapter): void {
    this.identityAdapters.set(adapter.code.toUpperCase(), adapter);
  }

  public static getIdentityAdapter(code: string): IdentityVerificationAdapter | undefined {
    return this.identityAdapters.get(code.toUpperCase());
  }

  public static registerTelecomAdapter(adapter: TelecomVtuAdapter): void {
    this.telecomAdapters.set(adapter.code.toUpperCase(), adapter);
  }

  public static getTelecomAdapter(code: string): TelecomVtuAdapter | undefined {
    return this.telecomAdapters.get(code.toUpperCase());
  }
}
