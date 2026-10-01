<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Config\Database;
use HambakTech\Utils\Response;
use PDO;

class ShopController extends BaseController
{
    public function getProducts(): void
    {
        $pdo = Database::getConnection();
        $categoryId = $_GET['category_id'] ?? null;

        if ($categoryId) {
            $stmt = $pdo->prepare("
                SELECT p.id, p.category_id, p.name, p.slug, p.sku, p.description, p.price, p.stock_quantity, p.image_url,
                       c.name AS category_name
                FROM products p
                JOIN product_categories c ON p.category_id = c.id
                WHERE p.is_active = 1 AND p.category_id = ?
                ORDER BY p.name ASC
            ");
            $stmt->execute([$categoryId]);
        } else {
            $stmt = $pdo->query("
                SELECT p.id, p.category_id, p.name, p.slug, p.sku, p.description, p.price, p.stock_quantity, p.image_url,
                       c.name AS category_name
                FROM products p
                JOIN product_categories c ON p.category_id = c.id
                WHERE p.is_active = 1
                ORDER BY p.name ASC
            ");
        }

        Response::success($stmt->fetchAll(), 'Shop products retrieved.');
    }

    public function getCategories(): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT id, name, slug, icon FROM product_categories WHERE is_active = 1 ORDER BY name ASC");
        Response::success($stmt->fetchAll(), 'Product categories retrieved.');
    }

    public function getDeliveryZones(): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT id, name, lga, delivery_fee, estimated_hours FROM delivery_zones WHERE is_active = 1 ORDER BY delivery_fee ASC");
        Response::success($stmt->fetchAll(), 'Delivery zones retrieved.');
    }

    public function createProduct(): void
    {
        $user = $this->getAuthUser();
        if (!in_array($user['role'], ['super_admin', 'admin'], true)) {
            Response::error('Administrative privilege required.', 403);
            return;
        }

        $body = $this->getJsonBody();
        $name = trim($body['name'] ?? '');
        $categoryId = $body['categoryId'] ?? $body['category_id'] ?? null;
        $price = floatval($body['price'] ?? 0);
        $stock = intval($body['stockQuantity'] ?? $body['stock_quantity'] ?? 0);
        $sku = $body['sku'] ?? ('HT-SKU-' . strtoupper(substr(uniqid(), -6)));
        $description = $body['description'] ?? '';

        if (empty($name)) {
            Response::error('Product name is required.', 422);
            return;
        }

        $pdo = Database::getConnection();
        $slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $name));
        $stmt = $pdo->prepare("
            INSERT INTO products (id, category_id, name, slug, sku, description, price, stock_quantity, is_active, created_at, updated_at)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        ");
        $stmt->execute([$categoryId, $name, $slug, $sku, $description, $price, $stock]);

        Response::success([
            'name' => $name,
            'sku' => $sku,
            'price' => $price,
            'stock_quantity' => $stock
        ], 'Product added to inventory successfully.', 201);
    }
}
