<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Services\OrderService;
use HambakTech\Utils\Response;
use HambakTech\Config\Database;
use PDO;

class OrderController extends BaseController
{
    private OrderService $orderService;

    public function __construct(?OrderService $orderService = null)
    {
        parent::__construct();
        $this->orderService = $orderService ?? new OrderService();
    }

    public function listOrders(): void
    {
        $user = $this->getAuthUser();
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $orders = $this->orderService->getUserOrders($user['id'], $limit, $offset);
        Response::success($orders, 'Orders retrieved.');
    }

    public function createOrder(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();

        $serviceCode = $body['serviceCode'] ?? $body['service_code'] ?? 'GENERAL';
        $title = $body['title'] ?? 'Digital Service Order';
        $amount = (float)($body['amount'] ?? $body['totalAmount'] ?? 0);
        $items = $body['items'] ?? [];
        $paymentMethod = $body['paymentMethod'] ?? 'WALLET';
        $metadata = $body['metadata'] ?? null;

        $result = $this->orderService->createOrder($user, $serviceCode, $title, $amount, $items, $paymentMethod, $metadata);
        Response::success($result, 'Order created successfully.', 201);
    }

    public function getOrder(array $params): void
    {
        $user = $this->getAuthUser();
        $orderId = $params['id'] ?? '';

        $pdo = Database::getConnection();
        $isStaff = $this->isStaff($user);

        if ($isStaff) {
            $stmt = $pdo->prepare("
                SELECT o.*, 
                       (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', i.name, 'quantity', i.quantity, 'unitPrice', i.unit_price, 'subtotal', i.subtotal))
                        FROM order_items i WHERE i.order_id = o.id) AS items,
                       (SELECT JSON_ARRAYAGG(JSON_OBJECT('status', t.status, 'title', t.title, 'note', t.note, 'createdAt', t.created_at))
                        FROM order_timeline t WHERE t.order_id = o.id ORDER BY t.created_at ASC) AS timeline
                FROM orders o
                WHERE (o.id = ? OR o.order_number = ?)
                LIMIT 1
            ");
            $stmt->execute([$orderId, $orderId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT o.*, 
                       (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', i.name, 'quantity', i.quantity, 'unitPrice', i.unit_price, 'subtotal', i.subtotal))
                        FROM order_items i WHERE i.order_id = o.id) AS items,
                       (SELECT JSON_ARRAYAGG(JSON_OBJECT('status', t.status, 'title', t.title, 'note', t.note, 'createdAt', t.created_at))
                        FROM order_timeline t WHERE t.order_id = o.id ORDER BY t.created_at ASC) AS timeline
                FROM orders o
                WHERE (o.id = ? OR o.order_number = ?) AND o.user_id = ?
                LIMIT 1
            ");
            $stmt->execute([$orderId, $orderId, $user['id']]);
        }
        $order = $stmt->fetch();

        if (!$order) {
            Response::notFound("Order not found or access denied.");
            return;
        }

        if (isset($order['items']) && is_string($order['items'])) {
            $order['items'] = json_decode($order['items'], true) ?? [];
        }
        if (isset($order['timeline']) && is_string($order['timeline'])) {
            $order['timeline'] = json_decode($order['timeline'], true) ?? [];
        }

        Response::success($order, 'Order details retrieved.');
    }
}
