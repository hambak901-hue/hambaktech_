<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Services\SupportService;
use HambakTech\Utils\Response;
use HambakTech\Config\Database;
use PDO;

class SupportController extends BaseController
{
    private SupportService $supportService;

    public function __construct(?SupportService $supportService = null)
    {
        parent::__construct();
        $this->supportService = $supportService ?? new SupportService();
    }

    /**
     * Public contact desk endpoint (No login required).
     */
    public function submitInquiry(): void
    {
        $body = $this->getJsonBody();
        $name = $body['name'] ?? '';
        $email = $body['email'] ?? '';
        $message = $body['message'] ?? '';
        $service = $body['service'] ?? 'general';
        $phone = $body['phone'] ?? null;

        $result = $this->supportService->submitPublicInquiry($name, $email, $message, $service, $phone);
        Response::success($result, $result['message'], 201);
    }

    public function listTickets(): void
    {
        $user = $this->getAuthUser();
        $isStaff = $this->isStaff($user);

        $pdo = Database::getConnection();
        if ($isStaff) {
            $stmt = $pdo->query("
                SELECT t.id, t.ticket_number, t.category, t.subject, t.priority, t.status, t.created_at, t.updated_at,
                       u.email AS customer_email, p.first_name, p.last_name
                FROM support_tickets t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN user_profiles p ON u.id = p.user_id
                ORDER BY t.created_at DESC
                LIMIT 100
            ");
        } else {
            $stmt = $pdo->prepare("
                SELECT id, ticket_number, category, subject, priority, status, created_at, updated_at
                FROM support_tickets
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 50
            ");
            $stmt->execute([$user['id']]);
        }

        $tickets = $stmt->fetchAll();
        Response::success($tickets, 'Support tickets retrieved.');
    }

    public function createTicket(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();
        $subject = $body['subject'] ?? '';
        $message = $body['message'] ?? '';
        $category = $body['category'] ?? 'TECHNICAL';
        $priority = $body['priority'] ?? 'MEDIUM';

        $result = $this->supportService->createTicket($user, $subject, $message, $category, $priority);
        Response::success($result, 'Support ticket created successfully.', 201);
    }

    public function replyTicket(array $params): void
    {
        $user = $this->getAuthUser();
        $ticketId = $params['id'] ?? '';
        $body = $this->getJsonBody();
        $content = $body['content'] ?? $body['message'] ?? '';

        $result = $this->supportService->replyTicket($ticketId, $user, $content);
        Response::success($result, 'Response posted successfully.');
    }

    public function updateTicket(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin', 'staff']);
        $body = $this->getJsonBody();
        $id = $params['id'] ?? $body['id'] ?? '';
        $status = $body['status'] ?? null;
        $priority = $body['priority'] ?? null;
        $subject = $body['subject'] ?? null;

        if (empty($id)) {
            Response::badRequest('Ticket ID is required.');
            return;
        }

        $pdo = Database::getConnection();
        $fields = [];
        $values = [];
        if ($status) {
            $fields[] = "status = ?";
            $values[] = strtoupper((string)$status);
        }
        if ($priority) {
            $fields[] = "priority = ?";
            $values[] = strtoupper((string)$priority);
        }
        if ($subject) {
            $fields[] = "subject = ?";
            $values[] = $subject;
        }
        $fields[] = "updated_at = NOW()";
        $values[] = $id;

        $stmt = $pdo->prepare("UPDATE support_tickets SET " . implode(", ", $fields) . " WHERE id = ?");
        $stmt->execute($values);

        Response::success(null, 'Ticket updated.');
    }

    public function deleteTicket(array $params = []): void
    {
        $this->requireRoles(['super_admin', 'admin']);
        $id = $params['id'] ?? '';
        if (empty($id)) {
            $body = $this->getJsonBody();
            $id = $body['id'] ?? '';
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM support_tickets WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(null, 'Ticket deleted.');
    }
}
