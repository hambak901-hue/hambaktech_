import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.3",
    info: {
      title: "HambakTech Unified Authoritative API",
      version: "1.0.0-m11",
      description:
        "Authoritative API powering Web, Android, and iOS clients for HambakTech Smart Digital & ICT Platform. Features unified authentication, authoritative wallet ledger, server-side dynamic pricing, academy LMS, shop commerce, and notifications without duplication.",
      contact: {
        name: "HambakTech Engineering Support",
        email: "support@hambaktech.com.ng",
        url: "https://hambaktech.com.ng",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "Primary Authoritative API v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT/SessionToken",
          description: "Authoritative session token passed as 'Bearer <token>' header or cookie",
        },
      },
      schemas: {
        StandardSuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            message: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        StandardErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "VALIDATION_ERROR" },
                message: { type: "string" },
                details: { type: "array" },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        UserPayload: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            fullName: { type: "string" },
            phone: { type: "string" },
            role: { type: "string" },
            customerTier: { type: "string", enum: ["STANDARD", "SILVER", "GOLD", "VIP"] },
          },
        },
        WalletPayload: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            currency: { type: "string", example: "NGN" },
            currentBalance: { type: "number", example: 15500 },
            ledgerBalance: { type: "number", example: 15500 },
            lockedBalance: { type: "number", example: 0 },
            status: { type: "string", example: "ACTIVE" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/auth/login": {
        post: {
          summary: "Authenticate user and issue session token",
          tags: ["Auth"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["identifier", "password"],
                  properties: {
                    identifier: { type: "string", description: "Email or phone number" },
                    password: { type: "string" },
                    rememberMe: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Session created with bearer token" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/register": {
        post: {
          summary: "Register new customer account",
          tags: ["Auth"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "phone", "password", "firstName", "lastName"],
                  properties: {
                    email: { type: "string", format: "email" },
                    phone: { type: "string" },
                    password: { type: "string", minLength: 8 },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "User registered" } },
        },
      },
      "/auth/me": {
        get: {
          summary: "Get current authenticated user profile and wallet",
          tags: ["Auth"],
          responses: { 200: { description: "Current user profile" } },
        },
      },
      "/wallet": {
        get: {
          summary: "Authoritative wallet balance and ledger status",
          tags: ["Wallet"],
          responses: { 200: { description: "Wallet status" } },
        },
      },
      "/wallet/transactions": {
        get: {
          summary: "Transaction history with pagination and status filter",
          tags: ["Wallet"],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "type", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "Paginated transaction records" } },
        },
      },
      "/wallet/fund": {
        post: {
          summary: "Fund wallet via supported gateway (Paystack, Flutterwave, Moniepoint)",
          tags: ["Wallet"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["amount"],
                  properties: {
                    amount: { type: "number", minimum: 100 },
                    paymentMethod: { type: "string", enum: ["PAYSTACK", "FLUTTERWAVE", "MONIEPOINT", "BANK_TRANSFER"] },
                    reference: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Wallet funded" } },
        },
      },
      "/orders": {
        get: {
          summary: "List user orders",
          tags: ["Orders"],
          responses: { 200: { description: "User orders" } },
        },
        post: {
          summary: "Create authoritative service order",
          tags: ["Orders"],
          responses: { 201: { description: "Order created" } },
        },
      },
      "/services": {
        get: {
          summary: "List digital and ICT services catalog",
          tags: ["Services"],
          security: [],
          responses: { 200: { description: "Active services" } },
        },
      },
      "/services/calculate-price": {
        post: {
          summary: "Server-side dynamic price calculation with tier discount",
          tags: ["Services"],
          security: [],
          responses: { 200: { description: "Authoritative price calculation" } },
        },
      },
      "/academy/courses": {
        get: {
          summary: "List available academy training courses",
          tags: ["Academy"],
          security: [],
          responses: { 200: { description: "Courses catalog" } },
        },
      },
      "/academy/enroll": {
        post: {
          summary: "Enroll in academy course with optional wallet tuition debit",
          tags: ["Academy"],
          responses: { 201: { description: "Student enrolled" } },
        },
      },
      "/shop/products": {
        get: {
          summary: "Browse physical shop products and accessories",
          tags: ["Shop"],
          security: [],
          responses: { 200: { description: "Shop inventory products" } },
        },
      },
      "/shop/orders": {
        post: {
          summary: "Place shop hardware order with stock reservation and delivery",
          tags: ["Shop"],
          responses: { 201: { description: "Shop order placed" } },
        },
      },
      "/notifications": {
        get: {
          summary: "Get user notifications and announcements",
          tags: ["Notifications"],
          responses: { 200: { description: "Notifications list" } },
        },
      },
      "/system/config": {
        get: {
          summary: "Retrieve mobile app configuration, version requirements, and support channels",
          tags: ["System"],
          security: [],
          responses: { 200: { description: "App configuration" } },
        },
      },
      "/system/health": {
        get: {
          summary: "Check system health and database status",
          tags: ["System"],
          security: [],
          responses: { 200: { description: "Health report" } },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
