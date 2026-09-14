/**
 * HAMBAKTECH WALLET OPERATIONS & ORDER STATUS TRANSITIONS TEST SUITE
 * 
 * Verifies:
 * 1. Digital wallet retrieval and initial state
 * 2. Authoritative wallet funding and balance updates
 * 3. Input validation on financial operations (rejection of zero/negative amounts)
 * 4. Ledger integrity (double-entry tracking of credit and debit events)
 * 5. Service order placement via digital wallet debit
 * 6. Overdraft prevention (rejection of orders when balance is insufficient)
 * 7. Order status lifecycle transitions (PENDING -> PROCESSING -> COMPLETED)
 * 8. Order access security and isolation between customer accounts
 */

import { WalletService, OrderService, AdminService } from "../src/lib/server/platform-store";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

async function runTests() {
  console.log("=================================================================");
  console.log("🚀 STARTING HAMBAKTECH WALLET & ORDER TRANSITIONS TEST SUITE");
  console.log("=================================================================\n");

  const userIdA = `user_test_${Date.now()}_a`;
  const userIdB = `user_test_${Date.now()}_b`;

  // -------------------------------------------------------------------------
  // 1. WALLET INITIALIZATION
  // -------------------------------------------------------------------------
  console.log("Step 1: Testing Digital Wallet Initialization...");
  const walletA = await WalletService.getWallet(userIdA);
  assert(walletA.userId === userIdA, "Wallet correctly associated with user ID");
  assert(walletA.currentBalance === 0, "Initial wallet current balance is 0.00");
  assert(walletA.status === "ACTIVE", "Initial wallet status is ACTIVE");
  console.log("");

  // -------------------------------------------------------------------------
  // 2. WALLET FUNDING (POSITIVE AMOUNTS)
  // -------------------------------------------------------------------------
  console.log("Step 2: Testing Wallet Funding & Double-Entry Ledger...");
  const fundResult = await WalletService.fundWallet({
    userId: userIdA,
    userName: "Test User A",
    userEmail: "userA@hambaktech.com.ng",
    amount: 50000,
    paymentMethod: "PAYSTACK",
    reference: `PAYSTACK_REF_${Date.now()}`,
    description: "Initial wallet test credit",
  });

  assert(fundResult.wallet.currentBalance === 50000, "Wallet balance updated to ₦50,000");
  assert(fundResult.transaction.amount === 50000, "Transaction record created for ₦50,000");
  assert(fundResult.transaction.status === "SUCCESSFUL", "Transaction status is SUCCESSFUL");

  const ledger = await WalletService.getLedgerEntries(walletA.id);
  const creditEntry = ledger.find((l) => l.entryType === "CREDIT" && l.amount === 50000);
  assert(!!creditEntry, "Ledger contains CREDIT record matching transaction amount");
  assert(creditEntry?.balanceAfter === 50000, "Ledger balanceAfter precisely matches wallet balance");
  console.log("");

  // -------------------------------------------------------------------------
  // 3. FINANCIAL INPUT VALIDATION
  // -------------------------------------------------------------------------
  console.log("Step 3: Testing Financial Validation (Zero & Negative Amounts)...");
  let zeroFundRejected = false;
  try {
    await WalletService.fundWallet({
      userId: userIdA,
      userName: "Test User A",
      userEmail: "userA@hambaktech.com.ng",
      amount: 0,
      paymentMethod: "PAYSTACK",
    });
  } catch (err: any) {
    zeroFundRejected = true;
  }
  assert(zeroFundRejected, "Funding with 0.00 is strictly rejected");

  let negativeFundRejected = false;
  try {
    await WalletService.fundWallet({
      userId: userIdA,
      userName: "Test User A",
      userEmail: "userA@hambaktech.com.ng",
      amount: -1500,
      paymentMethod: "PAYSTACK",
    });
  } catch (err: any) {
    negativeFundRejected = true;
  }
  assert(negativeFundRejected, "Funding with negative amount is strictly rejected");
  console.log("");

  // -------------------------------------------------------------------------
  // 4. SERVICE ORDER PLACEMENT VIA WALLET DEBIT
  // -------------------------------------------------------------------------
  console.log("Step 4: Testing Service Order Creation & Wallet Debit...");
  const orderItemPrice = 12000;
  const order = await OrderService.createServiceOrder({
    userId: userIdA,
    userName: "Test User A",
    userEmail: "userA@hambaktech.com.ng",
    serviceCategorySlug: "nin-services",
    serviceCategoryName: "NIN & Identity Services",
    serviceTitle: "NIN Slip Reprint Standard",
    items: [
      {
        title: "NIN Slip Plastic ID Card Print",
        quantity: 1,
        unitPrice: orderItemPrice,
        serviceId: "nin-print-01",
      },
    ],
    paymentMethod: "WALLET",
    deliveryType: "COURIER_DELIVERY",
    notes: "Please deliver to office address",
  });

  assert(order.totalAmount === 12000, "Order total calculated correctly as ₦12,000");
  assert(order.paymentStatus === "PAID", "Wallet-paid order payment status is PAID");
  assert(order.status === "PENDING", "Initial order workflow status is PENDING");

  const updatedWalletA = await WalletService.getWallet(userIdA);
  assert(updatedWalletA.currentBalance === 38000, "Wallet balance accurately debited by ₦12,000 (Remaining: ₦38,000)");

  const updatedLedger = await WalletService.getLedgerEntries(walletA.id);
  const debitEntry = updatedLedger.find((l) => l.entryType === "DEBIT" && l.amount === 12000);
  assert(!!debitEntry, "Double-entry ledger contains DEBIT record for ₦12,000");
  assert(debitEntry?.balanceAfter === 38000, "Debit balanceAfter reflects post-order balance");
  console.log("");

  // -------------------------------------------------------------------------
  // 5. OVERDRAFT PREVENTION
  // -------------------------------------------------------------------------
  console.log("Step 5: Testing Overdraft Prevention...");
  let overdraftPrevented = false;
  try {
    // Attempt to purchase an order costing ₦100,000 with only ₦38,000 in wallet
    await OrderService.createServiceOrder({
      userId: userIdA,
      userName: "Test User A",
      userEmail: "userA@hambaktech.com.ng",
      serviceCategorySlug: "cac-services",
      serviceCategoryName: "Corporate Affairs Commission",
      serviceTitle: "Full Company Incorporation Package",
      items: [
        {
          title: "CAC Ltd Registration",
          quantity: 1,
          unitPrice: 100000,
          serviceId: "cac-ltd-full",
        },
      ],
      paymentMethod: "WALLET",
    });
  } catch (err: any) {
    overdraftPrevented = true;
  }
  assert(overdraftPrevented, "Order exceeding wallet balance is rejected with Insufficient Balance");

  const walletAfterFailedOrder = await WalletService.getWallet(userIdA);
  assert(walletAfterFailedOrder.currentBalance === 38000, "Wallet balance remains untouched after rejected order");
  console.log("");

  // -------------------------------------------------------------------------
  // 6. ORDER STATUS LIFECYCLE TRANSITIONS
  // -------------------------------------------------------------------------
  console.log("Step 6: Testing Order Status Progression...");
  const processingOrder = await AdminService.updateOrderStatus(
    order.id,
    "PROCESSING",
    "Application verified and processing with verification authority",
    "AdminStaff"
  );
  assert(processingOrder?.status === "PROCESSING", "Order transitioned to PROCESSING");
  assert(
    processingOrder?.statusTimeline.some((t) => t.status === "PROCESSING"),
    "Timeline record appended for PROCESSING status"
  );

  const completedOrder = await AdminService.updateOrderStatus(
    order.id,
    "COMPLETED",
    "Document printed and ready for pickup",
    "AdminStaff"
  );
  assert(completedOrder?.status === "COMPLETED", "Order transitioned to COMPLETED");
  assert(
    completedOrder?.statusTimeline.some((t) => t.status === "COMPLETED"),
    "Timeline record appended for COMPLETED status"
  );
  console.log("");

  // -------------------------------------------------------------------------
  // 7. ORDER ISOLATION & ACCESS CONTROL
  // -------------------------------------------------------------------------
  console.log("Step 7: Testing Customer Order Data Isolation...");
  const userAOrders = await OrderService.getOrders(userIdA);
  assert(userAOrders.length >= 1, "User A can view their own orders");

  const userBOrders = await OrderService.getOrders(userIdB);
  assert(userBOrders.length === 0, "User B has zero orders and cannot see User A's orders");

  let crossAccessForbidden = false;
  try {
    await OrderService.getOrderById(order.id, userIdB, false);
  } catch (err: any) {
    crossAccessForbidden = true;
  }
  assert(crossAccessForbidden, "User B accessing User A order by ID is rejected with FORBIDDEN");

  const adminView = await OrderService.getOrderById(order.id, undefined, true);
  assert(adminView?.id === order.id, "Admin can inspect order details with elevated privileges");
  console.log("");

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("=================================================================");
  console.log(`WALLET & ORDER TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
