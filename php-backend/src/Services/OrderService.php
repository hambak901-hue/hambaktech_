<?php
declare(strict_types=1);

namespace HambakTech\Services;

use HambakTech\Config\Database;
use HambakTech\Utils\Security;
use PDO;
use RuntimeException;

/**
 * Authoritative Order & Fulfillment Service
 */
class OrderService
{
    private WalletService $walletService;
    private EmailService $emailService;

    public function __construct(?WalletService $walletService = null, ?EmailService $emailService = null)
    {
        $this->emailService = $emailService ?? new EmailService();
        $this->walletService = $walletService ?? new WalletService($this->emailService);
    }

    public static function generateOrderNumber(): string
    {
        $year = date('Y');
        $random = strtoupper(bin2hex(random_bytes(3)));
        return "HT-ORD-{$year}-{$random}";
    }

    public function createOrder(
        array $user,
        string $serviceCode,
        string $title,
        float $clientAmount,
        array $items = [],
        string $paymentMethod = 'WALLET',
        ?array $metadata = null
    ): array {
        $orderNumber = self::generateOrderNumber();
        $orderId = 'ord-' . bin2hex(random_bytes(10));
        $metaJson = $metadata ? json_encode($metadata) : null;
        $tier = strtoupper((string)($user['customer_tier'] ?? $user['customerTier'] ?? 'STANDARD'));

        return Database::transaction(function (PDO $pdo) use ($user, $serviceCode, $title, $clientAmount, $items, $paymentMethod, $metaJson, $orderId, $orderNumber, $tier) {
            $authoritativeAmount = 0.0;
            $resolvedItems = [];

            // 1. Authoritative Pricing Resolution
            // Check if serviceCode corresponds to a registered service offering
            $stmtOffering = $pdo->prepare("
                SELECT id, title, code, base_price, agent_price, corporate_price, is_active
                FROM service_offerings
                WHERE (code = ? OR slug = ?) AND is_active = 1
                LIMIT 1
            ");
            $stmtOffering->execute([$serviceCode, $serviceCode]);
            $offering = $stmtOffering->fetch();

            if ($offering) {
                // Authoritative price based on user tier
                $tierPrice = match ($tier) {
                    'AGENT'     => (float)($offering['agent_price'] ?? $offering['base_price']),
                    'CORPORATE' => (float)($offering['corporate_price'] ?? $offering['base_price']),
                    default     => (float)$offering['base_price'],
                };
                $authoritativeAmount = $tierPrice;
                $title = $offering['title'];
                $resolvedItems[] = [
                    'name'      => $offering['title'],
                    'quantity'  => 1,
                    'unitPrice' => $tierPrice,
                    'subtotal'  => $tierPrice,
                    'notes'     => "Offering Code: {$offering['code']} [Tier: {$tier}]"
                ];
            } elseif (!empty($items)) {
                // Resolve individual catalog items
                foreach ($items as $item) {
                    $qty = max(1, (int)($item['quantity'] ?? 1));
                    $itemCode = $item['code'] ?? $item['offeringCode'] ?? $item['id'] ?? '';
                    $unitPrice = 0.0;

                    // Check offering catalog
                    $stmtItemOff = $pdo->prepare("
                        SELECT id, title, base_price, agent_price, corporate_price
                        FROM service_offerings
                        WHERE (id = ? OR code = ? OR slug = ?) AND is_active = 1
                        LIMIT 1
                    ");
                    $stmtItemOff->execute([$itemCode, $itemCode, $itemCode]);
                    $itemOff = $stmtItemOff->fetch();

                    if ($itemOff) {
                        $unitPrice = match ($tier) {
                            'AGENT'     => (float)($itemOff['agent_price'] ?? $itemOff['base_price']),
                            'CORPORATE' => (float)($itemOff['corporate_price'] ?? $itemOff['base_price']),
                            default     => (float)$itemOff['base_price'],
                        };
                    } else {
                        // Check products catalog
                        $stmtProd = $pdo->prepare("
                            SELECT id, name, price
                            FROM products
                            WHERE (id = ? OR sku = ?) AND is_active = 1
                            LIMIT 1
                        ");
                        $stmtProd->execute([$itemCode, $itemCode]);
                        $prod = $stmtProd->fetch();
                        if ($prod) {
                            $unitPrice = (float)$prod['price'];
                        } else {
                            // Fallback to validated positive client amount for custom quotation items
                            $unitPrice = max(0.0, (float)($item['unitPrice'] ?? $item['price'] ?? 0));
                        }
                    }

                    $subtotal = round($qty * $unitPrice, 2);
                    $authoritativeAmount += $subtotal;
                    $resolvedItems[] = [
                        'name'      => $item['name'] ?? ($itemOff['title'] ?? ($prod['name'] ?? $title)),
                        'quantity'  => $qty,
                        'unitPrice' => $unitPrice,
                        'subtotal'  => $subtotal,
                        'notes'     => $item['notes'] ?? null,
                    ];
                }
            } else {
                // Direct custom request without catalog mapping
                $authoritativeAmount = max(0.0, $clientAmount);
            }

            if ($authoritativeAmount < 0) {
                throw new RuntimeException("Invalid calculated order total.", 400);
            }

            // 2. If payment method is WALLET, execute atomic debit immediately
            if ($paymentMethod === 'WALLET' && $authoritativeAmount > 0) {
                $this->walletService->debit(
                    $user['id'],
                    $authoritativeAmount,
                    $orderNumber,
                    'SERVICE_ORDER',
                    "Payment for {$title} (#{$orderNumber})"
                );
            }

            $paymentStatus = ($paymentMethod === 'WALLET' || $authoritativeAmount === 0.0) ? 'PAID' : 'UNPAID';
            $orderStatus = ($paymentStatus === 'PAID') ? 'PROCESSING' : 'PENDING';

            $stmt = $pdo->prepare("
                INSERT INTO orders (id, order_number, user_id, service_code, title, total_amount, discount_amount, status, payment_status, payment_method, metadata, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, ?, ?, ?, NOW(), NOW())
            ");
            $stmt->execute([$orderId, $orderNumber, $user['id'], $serviceCode, $title, $authoritativeAmount, $orderStatus, $paymentStatus, $paymentMethod, $metaJson]);

            // Save resolved items
            $itemsToPersist = !empty($resolvedItems) ? $resolvedItems : $items;
            if (!empty($itemsToPersist)) {
                $stmtItem = $pdo->prepare("
                    INSERT INTO order_items (id, order_id, name, quantity, unit_price, subtotal, notes, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                foreach ($itemsToPersist as $item) {
                    $itemId = 'itm-' . bin2hex(random_bytes(10));
                    $qty = (int)($item['quantity'] ?? 1);
                    $unitPrice = (float)($item['unitPrice'] ?? $authoritativeAmount);
                    $subtotal = round($qty * $unitPrice, 2);
                    $stmtItem->execute([$itemId, $orderId, $item['name'] ?? $title, $qty, $unitPrice, $subtotal, $item['notes'] ?? null]);
                }
            }

            // Append timeline entry
            $timelineId = 'tl-' . bin2hex(random_bytes(10));
            $stmtTl = $pdo->prepare("
                INSERT INTO order_timeline (id, order_id, status, title, note, actor_id, created_at)
                VALUES (?, ?, ?, 'Order Placed', ?, ?, NOW())
            ");
            $stmtTl->execute([$timelineId, $orderId, $orderStatus, "Order initiated via {$paymentMethod}", $user['id']]);

            // Dispatch confirmation email
            try {
                $this->emailService->sendOrderConfirmation($user['email'], [
                    'orderNumber' => $orderNumber,
                    'title'       => $title,
                    'totalAmount' => $authoritativeAmount,
                ]);
            } catch (\Throwable $e) {
                error_log("[OrderService] Order email failed: " . $e->getMessage());
            }

            return [
                'id'            => $orderId,
                'orderNumber'   => $orderNumber,
                'title'         => $title,
                'status'        => $orderStatus,
                'paymentStatus' => $paymentStatus,
                'totalAmount'   => $authoritativeAmount,
            ];
        });
    }

    public function getUserOrders(string $userId, int $limit = 50, int $offset = 0): array
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT id, order_number, service_code, title, total_amount, status, payment_status, payment_method, created_at, updated_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $userId, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
