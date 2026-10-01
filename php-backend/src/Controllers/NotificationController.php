<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Config\Database;
use HambakTech\Utils\Response;
use PDO;

class NotificationController extends BaseController
{
    public function listNotifications(): void
    {
        $user = $this->getAuthUser();
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT id, user_id, title, message, type, is_read, action_url, created_at
            FROM notifications
            WHERE user_id = ? OR user_id IS NULL
            ORDER BY created_at DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $user['id']);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();

        $notifications = $stmt->fetchAll();
        Response::success($notifications, 'Notifications retrieved.');
    }

    public function markAsRead(array $params): void
    {
        $user = $this->getAuthUser();
        $id = $params['id'] ?? '';

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            UPDATE notifications
            SET is_read = 1
            WHERE id = ? AND (user_id = ? OR user_id IS NULL)
        ");
        $stmt->execute([$id, $user['id']]);

        Response::success(null, 'Notification marked as read.');
    }

    public function markAllAsRead(): void
    {
        $user = $this->getAuthUser();

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            UPDATE notifications
            SET is_read = 1
            WHERE user_id = ? OR user_id IS NULL
        ");
        $stmt->execute([$user['id']]);

        Response::success(null, 'All notifications marked as read.');
    }

    public function broadcastNotification(): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $body = $this->getJsonBody();

        $title = trim($body['title'] ?? '');
        $message = trim($body['message'] ?? '');
        $type = strtoupper(trim($body['type'] ?? 'ANNOUNCEMENT'));
        $actionUrl = trim($body['actionUrl'] ?? $body['action_url'] ?? '');

        if (empty($title) || empty($message)) {
            Response::badRequest('Title and message are required.');
            return;
        }

        $id = 'notif_' . bin2hex(random_bytes(8));
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO notifications (id, user_id, title, message, type, is_read, action_url, created_at)
            VALUES (?, NULL, ?, ?, ?, 0, ?, NOW())
        ");
        $stmt->execute([$id, $title, $message, $type, $actionUrl ?: null]);

        Response::success(['id' => $id], 'Broadcast notification sent.', 201);
    }

    public function deleteNotification(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $id = $params['id'] ?? '';
        if (empty($id)) {
            $body = $this->getJsonBody();
            $id = $body['id'] ?? '';
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(null, 'Notification deleted.');
    }
}
