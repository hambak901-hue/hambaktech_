<?php
declare(strict_types=1);

namespace HambakTech\Services;

use HambakTech\Config\Database;
use HambakTech\Config\Env;
use HambakTech\Services\Payments\PaymentProviderRegistry;
use HambakTech\Utils\Money;
use HambakTech\Utils\Security;
use PDO;
use RuntimeException;
use InvalidArgumentException;

/**
 * Authoritative Double-Entry Financial Ledger & Wallet Service
 * Enforces ACID atomicity, strict balance checking, overdraft prevention,
 * provider adapter orchestration, and cryptographic webhook verification.
 */
class WalletService
{
    private EmailService $emailService;
    private PaymentProviderRegistry $providerRegistry;

    public function __construct(
        ?EmailService $emailService = null,
        ?PaymentProviderRegistry $providerRegistry = null
    ) {
        $this->emailService = $emailService ?? new EmailService();
        $this->providerRegistry = $providerRegistry ?? new PaymentProviderRegistry();
    }

    public function getWallet(string $userId): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, user_id, balance, ledger_balance, currency, status, created_at, updated_at FROM wallets WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $wallet = $stmt->fetch();

        if (!$wallet) {
            // Auto-provision wallet for existing registered user
            $walletId = 'wal-' . bin2hex(random_bytes(10));
            $stmtInsert = $pdo->prepare("
                INSERT INTO wallets (id, user_id, balance, ledger_balance, currency, status, created_at, updated_at) 
                VALUES (?, ?, 0.00, 0.00, 'NGN', 'ACTIVE', NOW(), NOW())
            ");
            $stmtInsert->execute([$walletId, $userId]);
            return [
                'id'            => $walletId,
                'userId'        => $userId,
                'balance'       => 0.00,
                'currentBalance'=> 0.00,
                'ledgerBalance' => 0.00,
                'lockedBalance' => 0.00,
                'currency'      => 'NGN',
                'status'        => 'ACTIVE',
                'createdAt'     => date('Y-m-d H:i:s'),
                'updatedAt'     => date('Y-m-d H:i:s'),
            ];
        }

        $balance = (float) $wallet['balance'];
        $ledgerBalance = (float) $wallet['ledger_balance'];

        return [
            'id'            => $wallet['id'],
            'userId'        => $wallet['user_id'],
            'balance'       => $balance,
            'currentBalance'=> $balance,
            'ledgerBalance' => $ledgerBalance,
            'lockedBalance' => 0.00,
            'currency'      => $wallet['currency'],
            'status'        => $wallet['status'],
            'createdAt'     => $wallet['created_at'] ?? date('Y-m-d H:i:s'),
            'updatedAt'     => $wallet['updated_at'] ?? date('Y-m-d H:i:s'),
        ];
    }

    /**
     * Atomically credits a user's wallet with double-entry ledger guarantee.
     */
    public function credit(string $userId, float $amount, string $reference, string $category, string $description, ?string $transactionId = null): array
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException("Credit amount must be strictly greater than zero.");
        }

        return Database::transaction(function (PDO $pdo) use ($userId, $amount, $reference, $category, $description, $transactionId) {
            // Check if ledger entry with this reference already exists (Idempotency)
            $stmtCheckRef = $pdo->prepare("SELECT id, amount, balance_before, balance_after, wallet_id FROM wallet_ledger WHERE reference = ?");
            $stmtCheckRef->execute([$reference]);
            $existingLedger = $stmtCheckRef->fetch();
            if ($existingLedger) {
                return [
                    'walletId'      => $existingLedger['wallet_id'],
                    'amount'        => (float)$existingLedger['amount'],
                    'balanceBefore' => (float)$existingLedger['balance_before'],
                    'balanceAfter'  => (float)$existingLedger['balance_after'],
                    'reference'     => $reference,
                    'idempotent'    => true,
                ];
            }

            // Row-level exclusive lock on wallet record
            $stmt = $pdo->prepare("SELECT id, balance, status FROM wallets WHERE user_id = ? FOR UPDATE");
            $stmt->execute([$userId]);
            $wallet = $stmt->fetch();

            if (!$wallet) {
                // Auto-provision within transaction
                $walletId = 'wal-' . bin2hex(random_bytes(10));
                $stmtInsert = $pdo->prepare("INSERT INTO wallets (id, user_id, balance, ledger_balance, currency, status, created_at, updated_at) VALUES (?, ?, 0.00, 0.00, 'NGN', 'ACTIVE', NOW(), NOW())");
                $stmtInsert->execute([$walletId, $userId]);
                $wallet = ['id' => $walletId, 'balance' => 0.00, 'status' => 'ACTIVE'];
            }

            if ($wallet['status'] !== 'ACTIVE') {
                throw new RuntimeException("Wallet is {$wallet['status']}. Financial operations are restricted.", 403);
            }

            $currentBalance = (float) $wallet['balance'];
            $newBalance = Money::add($currentBalance, $amount);

            // Update balance
            $stmtUp = $pdo->prepare("UPDATE wallets SET balance = ?, ledger_balance = ?, updated_at = NOW() WHERE id = ?");
            $stmtUp->execute([$newBalance, $newBalance, $wallet['id']]);

            // Append immutable ledger record
            $ledgerId = 'led-' . bin2hex(random_bytes(10));
            $stmtLedger = $pdo->prepare("
                INSERT INTO wallet_ledger (id, wallet_id, transaction_id, type, amount, balance_before, balance_after, reference, category, description, created_at)
                VALUES (?, ?, ?, 'CREDIT', ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmtLedger->execute([$ledgerId, $wallet['id'], $transactionId, $amount, $currentBalance, $newBalance, $reference, $category, $description]);

            return [
                'walletId'      => $wallet['id'],
                'amount'        => $amount,
                'balanceBefore' => $currentBalance,
                'balanceAfter'  => $newBalance,
                'reference'     => $reference,
            ];
        });
    }

    /**
     * Atomically debits a user's wallet with overdraft protection.
     */
    public function debit(string $userId, float $amount, string $reference, string $category, string $description, ?string $transactionId = null): array
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException("Debit amount must be strictly greater than zero.");
        }

        return Database::transaction(function (PDO $pdo) use ($userId, $amount, $reference, $category, $description, $transactionId) {
            // Row-level exclusive lock on wallet record
            $stmt = $pdo->prepare("SELECT id, balance, status FROM wallets WHERE user_id = ? FOR UPDATE");
            $stmt->execute([$userId]);
            $wallet = $stmt->fetch();

            if (!$wallet) {
                throw new RuntimeException("Target wallet not found for user.", 404);
            }

            if ($wallet['status'] !== 'ACTIVE') {
                throw new RuntimeException("Wallet is {$wallet['status']}. Operations restricted.", 403);
            }

            $currentBalance = (float) $wallet['balance'];
            if (Money::compare($currentBalance, $amount) < 0) {
                throw new RuntimeException("Insufficient wallet balance. Available: ₦" . number_format($currentBalance, 2) . ", Required: ₦" . number_format($amount, 2), 400);
            }

            $newBalance = Money::subtract($currentBalance, $amount);

            // Update balance
            $stmtUp = $pdo->prepare("UPDATE wallets SET balance = ?, ledger_balance = ?, updated_at = NOW() WHERE id = ?");
            $stmtUp->execute([$newBalance, $newBalance, $wallet['id']]);

            // Append immutable ledger record
            $ledgerId = 'led-' . bin2hex(random_bytes(10));
            $stmtLedger = $pdo->prepare("
                INSERT INTO wallet_ledger (id, wallet_id, transaction_id, type, amount, balance_before, balance_after, reference, category, description, created_at)
                VALUES (?, ?, ?, 'DEBIT', ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmtLedger->execute([$ledgerId, $wallet['id'], $transactionId, $amount, $currentBalance, $newBalance, $reference, $category, $description]);

            return [
                'walletId'      => $wallet['id'],
                'amount'        => $amount,
                'balanceBefore' => $currentBalance,
                'balanceAfter'  => $newBalance,
                'reference'     => $reference,
            ];
        });
    }

    /**
     * Phase 1: Initialize two-phase wallet funding session with external provider.
     */
    public function initializeFunding(string $userId, float $amount, string $channel = 'PAYSTACK', array $metadata = []): array
    {
        if ($amount < 100) {
            throw new InvalidArgumentException("Minimum wallet funding amount is ₦100.00");
        }

        $wallet = $this->getWallet($userId);
        if ($wallet['status'] !== 'ACTIVE') {
            throw new RuntimeException("Cannot fund wallet: account is currently {$wallet['status']}.", 403);
        }

        $txReference = 'HT-TX-' . strtoupper(bin2hex(random_bytes(6)));
        $payReference = 'HT-PAY-' . strtoupper(bin2hex(random_bytes(6)));
        $providerSlug = strtoupper(trim($channel));
        $provider = $this->providerRegistry->getProvider($providerSlug);

        // Fetch user email for provider session
        $pdo = Database::getConnection();
        $uStmt = $pdo->prepare("SELECT email FROM users WHERE id = ?");
        $uStmt->execute([$userId]);
        $userRow = $uStmt->fetch();
        $email = $userRow['email'] ?? 'customer@hambaktech.com.ng';

        return Database::transaction(function (PDO $pdo) use (
            $userId, $amount, $txReference, $payReference, $providerSlug, $provider, $email, $metadata
        ) {
            $txId = 'tx-' . bin2hex(random_bytes(10));
            $payId = 'pay-' . bin2hex(random_bytes(10));

            // 1. Create PENDING transaction
            $tStmt = $pdo->prepare("
                INSERT INTO transactions (id, user_id, reference, type, amount, fee, total_amount, currency, status, channel, metadata, created_at, updated_at)
                VALUES (?, ?, ?, 'WALLET_FUNDING', ?, 0.00, ?, 'NGN', 'PENDING', ?, ?, NOW(), NOW())
            ");
            $tStmt->execute([
                $txId,
                $userId,
                $txReference,
                $amount,
                $amount,
                $providerSlug,
                json_encode(array_merge($metadata, ['payReference' => $payReference])),
            ]);

            // 2. Create PENDING payment attempt
            $pStmt = $pdo->prepare("
                INSERT INTO payments (id, user_id, transaction_id, provider, reference, amount, currency, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'NGN', 'PENDING', NOW(), NOW())
            ");
            $pStmt->execute([
                $payId,
                $userId,
                $txId,
                $providerSlug,
                $payReference,
                $amount,
            ]);

            // 3. Request provider checkout session
            $initResult = $provider->initializePayment([
                'amount'      => $amount,
                'email'       => $email,
                'reference'   => $payReference,
                'callbackUrl' => Env::get('APP_URL', 'https://hambaktech.com.ng') . '/dashboard/wallet/verify?reference=' . $payReference,
                'metadata'    => ['userId' => $userId, 'txReference' => $txReference],
            ]);

            if (!$initResult->success) {
                throw new RuntimeException($initResult->errorMessage ?? "Failed to initialize payment with {$providerSlug}", 502);
            }

            return [
                'transactionId'    => $txId,
                'reference'        => $payReference,
                'txReference'      => $txReference,
                'authorizationUrl' => $initResult->authorizationUrl,
                'amount'           => $amount,
                'currency'         => 'NGN',
                'channel'          => $providerSlug,
                'metadata'         => $initResult->metadata,
            ];
        });
    }

    /**
     * Phase 2: Authoritatively verify funding status and credit wallet if settled.
     */
    public function verifyFunding(string $userId, string $reference): array
    {
        $pdo = Database::getConnection();

        // 1. Locate payment and transaction record
        $stmt = $pdo->prepare("
            SELECT p.id as payment_id, p.user_id, p.transaction_id, p.provider, p.reference as pay_ref,
                   p.amount, p.currency, p.status as payment_status, t.id as tx_id, t.reference as tx_ref, t.status as tx_status
            FROM payments p
            LEFT JOIN transactions t ON p.transaction_id = t.id
            WHERE p.reference = ? OR t.reference = ?
            LIMIT 1
        ");
        $stmt->execute([$reference, $reference]);
        $payment = $stmt->fetch();

        if (!$payment) {
            throw new RuntimeException("Payment reference not found: {$reference}", 404);
        }

        // Enforce ownership: customer can only verify their own payments
        if ($payment['user_id'] !== $userId) {
            throw new RuntimeException("Unauthorized: payment does not belong to authenticated user.", 403);
        }

        // Idempotency: If already SUCCESSFUL, return current wallet state without re-crediting
        if ($payment['payment_status'] === 'SUCCESSFUL' || $payment['tx_status'] === 'SUCCESSFUL') {
            return [
                'status'         => 'SUCCESSFUL',
                'alreadySettled' => true,
                'reference'      => $payment['pay_ref'],
                'amount'         => (float)$payment['amount'],
                'wallet'         => $this->getWallet($userId),
            ];
        }

        // 2. Query provider API authoritatively
        $provider = $this->providerRegistry->getProvider($payment['provider']);
        $verifResult = $provider->verifyPayment($payment['pay_ref']);

        if ($verifResult->status === 'SUCCESSFUL') {
            // Provider amount validation
            if ($verifResult->amount > 0 && abs($verifResult->amount - (float)$payment['amount']) > 0.01) {
                throw new RuntimeException("Payment amount mismatch: expected ₦{$payment['amount']}, provider verified ₦{$verifResult->amount}", 400);
            }
            // Currency validation
            if (!empty($verifResult->currency) && strtoupper($verifResult->currency) !== strtoupper((string)$payment['currency'])) {
                throw new RuntimeException("Payment currency mismatch: expected {$payment['currency']}, provider verified {$verifResult->currency}", 400);
            }

            // Settle payment and credit wallet atomically
            return Database::transaction(function (PDO $pdo) use ($userId, $payment, $verifResult) {
                // Double check status under transaction
                $check = $pdo->prepare("SELECT status FROM payments WHERE id = ? FOR UPDATE");
                $check->execute([$payment['payment_id']]);
                $curr = $check->fetch();
                if ($curr && $curr['status'] === 'SUCCESSFUL') {
                    return [
                        'status'         => 'SUCCESSFUL',
                        'alreadySettled' => true,
                        'reference'      => $payment['pay_ref'],
                        'amount'         => (float)$payment['amount'],
                        'wallet'         => $this->getWallet($userId),
                    ];
                }

                // Update payment record
                $upPay = $pdo->prepare("
                    UPDATE payments 
                    SET status = 'SUCCESSFUL', provider_reference = ?, paid_at = NOW(), raw_response = ?, updated_at = NOW() 
                    WHERE id = ?
                ");
                $upPay->execute([
                    $verifResult->providerReference,
                    json_encode($verifResult->rawResponse),
                    $payment['payment_id']
                ]);

                // Update transaction record
                $upTx = $pdo->prepare("UPDATE transactions SET status = 'SUCCESSFUL', updated_at = NOW() WHERE id = ?");
                $upTx->execute([$payment['tx_id']]);

                // Credit wallet with double-entry guarantee
                $creditRes = $this->credit(
                    $userId,
                    (float)$payment['amount'],
                    $payment['pay_ref'],
                    'WALLET_FUNDING',
                    "Wallet funding via {$payment['provider']} ({$payment['pay_ref']})",
                    $payment['tx_id']
                );

                return [
                    'status'         => 'SUCCESSFUL',
                    'alreadySettled' => false,
                    'reference'      => $payment['pay_ref'],
                    'amount'         => (float)$payment['amount'],
                    'credit'         => $creditRes,
                    'wallet'         => $this->getWallet($userId),
                ];
            });
        } elseif ($verifResult->status === 'FAILED') {
            // Mark payment as failed
            $stmtFail = $pdo->prepare("UPDATE payments SET status = 'FAILED', updated_at = NOW() WHERE id = ?");
            $stmtFail->execute([$payment['payment_id']]);
            $stmtFailTx = $pdo->prepare("UPDATE transactions SET status = 'FAILED', updated_at = NOW() WHERE id = ?");
            $stmtFailTx->execute([$payment['tx_id']]);

            return [
                'status'         => 'FAILED',
                'alreadySettled' => false,
                'reference'      => $payment['pay_ref'],
                'amount'         => (float)$payment['amount'],
                'message'        => $verifResult->errorMessage ?? 'Payment was declined by provider.',
                'wallet'         => $this->getWallet($userId),
            ];
        }

        return [
            'status'         => 'PENDING',
            'alreadySettled' => false,
            'reference'      => $payment['pay_ref'],
            'amount'         => (float)$payment['amount'],
            'message'        => 'Payment is still processing with gateway.',
            'wallet'         => $this->getWallet($userId),
        ];
    }

    /**
     * Ingest inbound webhook, verify cryptographic HMAC signature, and credit wallet idempotently.
     */
    public function processWebhook(string $providerSlug, string $rawPayload, array $headers): array
    {
        $provider = $this->providerRegistry->getProvider($providerSlug);

        // 1. Verify cryptographic signature
        if (!$provider->verifyWebhookSignature($rawPayload, $headers)) {
            throw new RuntimeException("Invalid webhook cryptographic signature for {$providerSlug}", 401);
        }

        // 2. Parse normalized event
        $event = $provider->parseWebhookPayload($rawPayload);
        $reference = $event->reference;

        if (empty($reference)) {
            return ['status' => 'ignored', 'message' => 'No transaction reference in webhook event'];
        }

        $pdo = Database::getConnection();

        // Duplicate webhook protection: Check if event_id already processed
        if (!empty($event->eventId)) {
            $checkDup = $pdo->prepare("SELECT id FROM payment_webhooks WHERE provider = ? AND event_id = ? AND processed = 1 LIMIT 1");
            $checkDup->execute([$providerSlug, $event->eventId]);
            if ($checkDup->fetch()) {
                return ['status' => 'already_processed', 'reference' => $reference];
            }
        }

        // 3. Ingest raw webhook into payment_webhooks audit log
        $webhookId = 'whk-' . bin2hex(random_bytes(10));
        $logStmt = $pdo->prepare("
            INSERT INTO payment_webhooks (id, provider, event_id, event_type, reference, payload, processed, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
        ");
        $logStmt->execute([
            $webhookId,
            $providerSlug,
            $event->eventId,
            $event->eventType,
            $reference,
            $rawPayload
        ]);

        if ($event->status !== 'SUCCESSFUL') {
            return ['status' => 'ignored', 'message' => "Event {$event->eventType} with status {$event->status} does not require crediting."];
        }

        // 4. Atomic settlement under row-level lock
        return Database::transaction(function (PDO $pdo) use ($providerSlug, $reference, $event, $webhookId) {
            $stmt = $pdo->prepare("
                SELECT p.id as payment_id, p.user_id, p.transaction_id, p.amount, p.currency, p.status as payment_status,
                       t.id as tx_id, t.status as tx_status
                FROM payments p
                LEFT JOIN transactions t ON p.transaction_id = t.id
                WHERE p.reference = ? OR t.reference = ?
                FOR UPDATE
            ");
            $stmt->execute([$reference, $reference]);
            $payment = $stmt->fetch();

            if (!$payment) {
                // Reference not found in system
                $pdo->prepare("UPDATE payment_webhooks SET error_message = 'Payment reference not found' WHERE id = ?")->execute([$webhookId]);
                return ['status' => 'not_found', 'message' => 'Reference not found in platform'];
            }

            // Check if already processed (Idempotency)
            if ($payment['payment_status'] === 'SUCCESSFUL' || $payment['tx_status'] === 'SUCCESSFUL') {
                $pdo->prepare("UPDATE payment_webhooks SET processed = 1, processed_at = NOW() WHERE id = ?")->execute([$webhookId]);
                return ['status' => 'already_processed', 'reference' => $reference];
            }

            // Webhook amount validation: strictly reject missing, zero, or negative amounts
            if ($event->amount <= 0) {
                $pdo->prepare("UPDATE payment_webhooks SET error_message = 'Webhook amount is missing, zero, or invalid' WHERE id = ?")->execute([$webhookId]);
                return ['status' => 'invalid_amount', 'message' => 'Webhook amount is missing, zero, or invalid'];
            }

            if (abs($event->amount - (float)$payment['amount']) > 0.01) {
                $pdo->prepare("UPDATE payment_webhooks SET error_message = 'Webhook amount mismatch' WHERE id = ?")->execute([$webhookId]);
                return ['status' => 'amount_mismatch', 'message' => "Webhook amount {$event->amount} does not match expected {$payment['amount']}"];
            }

            // Webhook currency validation
            if (!empty($event->currency) && strtoupper($event->currency) !== strtoupper((string)$payment['currency'])) {
                $pdo->prepare("UPDATE payment_webhooks SET error_message = 'Webhook currency mismatch' WHERE id = ?")->execute([$webhookId]);
                return ['status' => 'currency_mismatch', 'message' => "Webhook currency {$event->currency} does not match {$payment['currency']}"];
            }

            // Mark payment & transaction SUCCESSFUL
            $pdo->prepare("UPDATE payments SET status = 'SUCCESSFUL', paid_at = NOW(), updated_at = NOW() WHERE id = ?")->execute([$payment['payment_id']]);
            $pdo->prepare("UPDATE transactions SET status = 'SUCCESSFUL', updated_at = NOW() WHERE id = ?")->execute([$payment['tx_id']]);

            // Credit wallet strictly with verified webhook amount (never fall back to database payment amount)
            $creditAmount = $event->amount;
            $this->credit(
                $payment['user_id'],
                $creditAmount,
                $reference,
                'WALLET_FUNDING',
                "Webhook settlement via {$providerSlug} ({$reference})",
                $payment['tx_id']
            );

            // Mark webhook processed
            $pdo->prepare("UPDATE payment_webhooks SET processed = 1, processed_at = NOW() WHERE id = ?")->execute([$webhookId]);

            return ['status' => 'credited', 'reference' => $reference, 'amount' => $creditAmount];
        });
    }

    /**
     * Settle a manual payment workflow (MONIEPOINT / BANK_TRANSFER).
     * Authoritatively verifies bank deposit / evidence, marks payment and transaction SUCCESSFUL,
     * credits the customer wallet, writes double-entry ledger, and logs immutable audit trail.
     * Automated gateways (PAYSTACK, FLUTTERWAVE, REMITA) are strictly rejected from manual settlement.
     */
    public function settleManualPayment(string $adminUserId, string $reference, string $adminNotes, ?string $depositProof = null): array
    {
        $pdo = Database::getConnection();

        return Database::transaction(function (PDO $pdo) use ($adminUserId, $reference, $adminNotes, $depositProof) {
            $stmt = $pdo->prepare("
                SELECT p.id as payment_id, p.user_id, p.transaction_id, p.provider, p.reference as pay_ref,
                       p.amount, p.currency, p.status as payment_status,
                       t.id as tx_id, t.reference as tx_ref, t.status as tx_status
                FROM payments p
                LEFT JOIN transactions t ON p.transaction_id = t.id
                WHERE p.reference = ? OR t.reference = ?
                FOR UPDATE
            ");
            $stmt->execute([$reference, $reference]);
            $payment = $stmt->fetch();

            if (!$payment) {
                throw new RuntimeException("Payment record not found for reference: {$reference}", 404);
            }

            // Only MANUAL channels are permitted for manual admin settlement
            $provider = strtoupper(trim((string)$payment['provider']));
            $allowedManual = ['MONIEPOINT', 'BANK_TRANSFER', 'MANUAL_TRANSFER'];
            if (!in_array($provider, $allowedManual, true)) {
                throw new RuntimeException("Manual settlement is prohibited for automated gateway '{$provider}'. Automated transactions must be verified via gateway requery or cryptographic webhook.", 400);
            }

            // Idempotency: cannot re-settle an already successful payment
            if ($payment['payment_status'] === 'SUCCESSFUL' || $payment['tx_status'] === 'SUCCESSFUL') {
                return [
                    'status'         => 'SUCCESSFUL',
                    'alreadySettled' => true,
                    'reference'      => $payment['pay_ref'],
                    'amount'         => (float)$payment['amount'],
                    'wallet'         => $this->getWallet($payment['user_id']),
                    'message'        => 'Payment was already settled previously.',
                ];
            }

            $amount = (float)$payment['amount'];
            if ($amount <= 0) {
                throw new RuntimeException("Cannot settle payment with zero or negative amount.", 400);
            }

            // Update payment record
            $notesPayload = json_encode([
                'settledByAdminId' => $adminUserId,
                'adminNotes'       => $adminNotes,
                'depositProof'     => $depositProof,
                'settledAt'        => date('c'),
            ]);
            $pdo->prepare("
                UPDATE payments
                SET status = 'SUCCESSFUL',
                    paid_at = NOW(),
                    raw_response = ?,
                    updated_at = NOW()
                WHERE id = ?
            ")->execute([$notesPayload, $payment['payment_id']]);

            // Update transaction record
            $pdo->prepare("
                UPDATE transactions
                SET status = 'SUCCESSFUL',
                    updated_at = NOW()
                WHERE id = ?
            ")->execute([$payment['tx_id']]);

            // Credit customer wallet with double-entry ledger entry
            $creditRes = $this->credit(
                $payment['user_id'],
                $amount,
                $payment['pay_ref'],
                'WALLET_FUNDING',
                "Manual {$provider} funding verified by admin ({$payment['pay_ref']})",
                $payment['tx_id']
            );

            // Immutable audit log
            $auditId = 'aud-' . bin2hex(random_bytes(10));
            $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, details, ip_address, created_at)
                VALUES (?, ?, 'Admin', 'admin@hambaktech.com.ng', 'MANUAL_PAYMENT_SETTLED', 'PAYMENT', ?, ?, ?, NOW())
            ")->execute([
                $auditId,
                $adminUserId,
                $payment['payment_id'],
                json_encode([
                    'reference'     => $payment['pay_ref'],
                    'provider'      => $provider,
                    'amount'        => $amount,
                    'customerUserId'=> $payment['user_id'],
                    'adminNotes'    => $adminNotes,
                    'depositProof'  => $depositProof,
                ]),
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);

            return [
                'status'         => 'SUCCESSFUL',
                'alreadySettled' => false,
                'reference'      => $payment['pay_ref'],
                'amount'         => $amount,
                'wallet'         => $creditRes,
                'message'        => "Manual {$provider} payment successfully verified and credited.",
            ];
        });
    }

    /**
     * Admin manual balance adjustment with mandatory audit trail.
     */
    public function adminAdjust(string $adminUserId, string $targetUserId, float $amount, string $type, string $reason): array
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException("Adjustment amount must be positive.");
        }

        $type = strtoupper(trim($type));
        if ($type !== 'CREDIT' && $type !== 'DEBIT') {
            throw new InvalidArgumentException("Adjustment type must be CREDIT or DEBIT.");
        }

        if (empty(trim($reason))) {
            throw new InvalidArgumentException("Adjustment reason is strictly mandatory.");
        }

        $ref = 'HT-ADJ-' . strtoupper(bin2hex(random_bytes(6)));

        return Database::transaction(function (PDO $pdo) use ($adminUserId, $targetUserId, $amount, $type, $reason, $ref) {
            if ($type === 'CREDIT') {
                $res = $this->credit(
                    $targetUserId,
                    $amount,
                    $ref,
                    'ADMIN_ADJUSTMENT',
                    "Admin adjustment (Credit): {$reason}"
                );
            } else {
                $res = $this->debit(
                    $targetUserId,
                    $amount,
                    $ref,
                    'ADMIN_ADJUSTMENT',
                    "Admin adjustment (Debit): {$reason}"
                );
            }

            // Record authoritative audit log
            $auditId = 'aud-' . bin2hex(random_bytes(10));
            $stmt = $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, details, ip_address, created_at)
                VALUES (?, ?, 'Admin', 'admin@hambaktech.com.ng', 'ADMIN_WALLET_ADJUSTMENT', 'WALLET', ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $auditId,
                $adminUserId,
                $res['walletId'],
                json_encode([
                    'type'          => $type,
                    'amount'        => $amount,
                    'reason'        => $reason,
                    'reference'     => $ref,
                    'balanceBefore' => $res['balanceBefore'],
                    'balanceAfter'  => $res['balanceAfter'],
                ]),
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);

            return $res;
        });
    }

    /**
     * Reverses an existing successful transaction and balances the ledger.
     */
    public function reverseTransaction(string $adminUserId, string $reference, string $reason): array
    {
        $pdo = Database::getConnection();

        return Database::transaction(function (PDO $pdo) use ($adminUserId, $reference, $reason) {
            $stmt = $pdo->prepare("SELECT id, user_id, type, amount, status FROM transactions WHERE reference = ? FOR UPDATE");
            $stmt->execute([$reference]);
            $tx = $stmt->fetch();

            if (!$tx) {
                throw new RuntimeException("Transaction reference not found: {$reference}", 404);
            }

            if ($tx['status'] === 'REVERSED') {
                throw new RuntimeException("Transaction has already been reversed.", 400);
            }

            if ($tx['status'] !== 'SUCCESSFUL') {
                throw new RuntimeException("Only SUCCESSFUL transactions can be reversed.", 400);
            }

            $amount = (float)$tx['amount'];
            $revRef = 'HT-REV-' . strtoupper(bin2hex(random_bytes(6)));

            // Balancing ledger operation:
            // If original was WALLET_FUNDING (credit to user), reverse by debiting
            // If original was SERVICE_PAYMENT (debit from user), reverse by crediting
            if ($tx['type'] === 'WALLET_FUNDING') {
                $balRes = $this->debit(
                    $tx['user_id'],
                    $amount,
                    $revRef,
                    'REVERSAL',
                    "Reversal of funding transaction {$reference}: {$reason}",
                    $tx['id']
                );
            } else {
                $balRes = $this->credit(
                    $tx['user_id'],
                    $amount,
                    $revRef,
                    'REVERSAL',
                    "Refund/reversal of transaction {$reference}: {$reason}",
                    $tx['id']
                );
            }

            // Update original transaction status to REVERSED
            $pdo->prepare("UPDATE transactions SET status = 'REVERSED', updated_at = NOW() WHERE id = ?")->execute([$tx['id']]);

            // Audit record
            $auditId = 'aud-' . bin2hex(random_bytes(10));
            $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, details, ip_address, created_at)
                VALUES (?, ?, 'Admin', 'admin@hambaktech.com.ng', 'TRANSACTION_REVERSAL', 'TRANSACTION', ?, ?, ?, NOW())
            ")->execute([
                $auditId,
                $adminUserId,
                $tx['id'],
                json_encode(['reference' => $reference, 'reason' => $reason, 'reversalRef' => $revRef, 'amount' => $amount]),
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);

            return [
                'success'           => true,
                'reversedReference' => $reference,
                'reversalReference' => $revRef,
                'amount'            => $amount,
                'wallet'            => $this->getWallet($tx['user_id']),
            ];
        });
    }

    /**
     * Authoritative double-entry balance reconciliation scanner for a wallet.
     * Invariant: wallet.balance == SUM(credits) - SUM(debits) == latest_ledger.balance_after
     */
    public function reconcileWallet(string $userId): array
    {
        $pdo = Database::getConnection();
        $wallet = $this->getWallet($userId);

        $stmt = $pdo->prepare("
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0.00) as total_credits,
                COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0.00) as total_debits,
                COUNT(*) as entry_count
            FROM wallet_ledger l
            JOIN wallets w ON l.wallet_id = w.id
            WHERE w.user_id = ?
        ");
        $stmt->execute([$userId]);
        $calc = $stmt->fetch();

        $totalCredits = (float)($calc['total_credits'] ?? 0);
        $totalDebits = (float)($calc['total_debits'] ?? 0);
        $ledgerDerivedBalance = round($totalCredits - $totalDebits, 2);

        // Get latest ledger entry balance_after
        $latestStmt = $pdo->prepare("
            SELECT balance_after 
            FROM wallet_ledger l
            JOIN wallets w ON l.wallet_id = w.id
            WHERE w.user_id = ?
            ORDER BY l.created_at DESC, l.id DESC
            LIMIT 1
        ");
        $latestStmt->execute([$userId]);
        $latestLedger = $latestStmt->fetch();
        $latestBalanceAfter = $latestLedger ? (float)$latestLedger['balance_after'] : 0.00;

        $discrepancy = round(abs($wallet['balance'] - $ledgerDerivedBalance), 2);
        $isReconciled = ($discrepancy < 0.001);

        if ($calc['entry_count'] > 0 && abs($wallet['balance'] - $latestBalanceAfter) >= 0.001) {
            $isReconciled = false;
        }

        return [
            'userId'               => $userId,
            'walletId'             => $wallet['id'],
            'walletBalance'        => $wallet['balance'],
            'totalCredits'         => $totalCredits,
            'totalDebits'          => $totalDebits,
            'ledgerDerivedBalance' => $ledgerDerivedBalance,
            'latestBalanceAfter'   => $latestBalanceAfter,
            'ledgerEntryCount'     => (int)$calc['entry_count'],
            'isReconciled'         => $isReconciled,
            'discrepancy'          => $discrepancy,
        ];
    }

    public function getLedger(string $userId, int $limit = 20, int $offset = 0): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT l.id, l.type, l.amount, l.balance_before, l.balance_after, l.reference, l.category, l.description, l.created_at
            FROM wallet_ledger l
            JOIN wallets w ON l.wallet_id = w.id
            WHERE w.user_id = ?
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $userId, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function getTransactions(string $userId, array $filters = []): array
    {
        $pdo = Database::getConnection();
        $limit = min(100, max(1, (int)($filters['limit'] ?? 20)));
        $offset = max(0, (int)($filters['offset'] ?? 0));

        $sql = "SELECT id, reference, type, amount, fee, total_amount, currency, status, channel, metadata, created_at, updated_at
                FROM transactions
                WHERE user_id = ?";
        $params = [$userId];

        if (!empty($filters['type'])) {
            $sql .= " AND type = ?";
            $params[] = $filters['type'];
        }
        if (!empty($filters['status'])) {
            $sql .= " AND status = ?";
            $params[] = $filters['status'];
        }

        // Count total
        $countSql = "SELECT COUNT(*) FROM (" . $sql . ") as cnt";
        $cStmt = $pdo->prepare($countSql);
        $cStmt->execute($params);
        $total = (int)$cStmt->fetchColumn();

        $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";

        $stmt = $pdo->prepare($sql);
        $idx = 1;
        foreach ($params as $val) {
            $stmt->bindValue($idx++, $val, PDO::PARAM_STR);
        }
        $stmt->bindValue($idx++, $limit, PDO::PARAM_INT);
        $stmt->bindValue($idx++, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll();
        $transactions = [];
        foreach ($rows as $r) {
            $transactions[] = [
                'id'          => $r['id'],
                'reference'   => $r['reference'],
                'type'        => $r['type'],
                'amount'      => (float)$r['amount'],
                'fee'         => (float)$r['fee'],
                'totalAmount' => (float)$r['total_amount'],
                'currency'    => $r['currency'],
                'status'      => $r['status'],
                'channel'     => $r['channel'],
                'metadata'    => json_decode($r['metadata'] ?? '{}', true),
                'createdAt'   => $r['created_at'],
                'updatedAt'   => $r['updated_at'],
            ];
        }

        return [
            'transactions' => $transactions,
            'pagination'   => [
                'total'  => $total,
                'limit'  => $limit,
                'offset' => $offset,
            ],
        ];
    }
}
