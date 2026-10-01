<?php
declare(strict_types=1);

namespace HambakTech\Services;

use HambakTech\Config\Database;
use HambakTech\Utils\RateLimiter;
use HambakTech\Utils\Security;
use PDO;
use RuntimeException;

/**
 * Authoritative Support Desk & Public Contact Service
 */
class SupportService
{
    private EmailService $emailService;

    public function __construct(?EmailService $emailService = null)
    {
        $this->emailService = $emailService ?? new EmailService();
    }

    /**
     * Generates a unique reference number formatted as HT-TKT-YYYY-XXXX
     */
    public static function generateTicketNumber(): string
    {
        $year = date('Y');
        $random = strtoupper(bin2hex(random_bytes(2)));
        $micro = substr((string) microtime(true), -2);
        return "HT-TKT-{$year}-{$random}{$micro}";
    }

    /**
     * Handles public website contact/support inquiry submissions.
     */
    public function submitPublicInquiry(
        string $name,
        string $email,
        string $message,
        string $service = 'general',
        ?string $phone = null
    ): array {
        $name = Security::sanitizeString($name);
        $email = strtolower(trim($email));
        $phone = Security::sanitizeString($phone);
        $service = Security::sanitizeString($service);
        $message = trim($message);
        $ip = RateLimiter::getClientIp();

        if (empty($name) || strlen($name) < 2) {
            throw new RuntimeException("Your name is required.", 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException("A valid email address is required.", 400);
        }

        if (empty($message) || strlen($message) < 5) {
            throw new RuntimeException("Please enter a detailed message so we can assist you.", 400);
        }

        // Anti-spam rate limit: 3 inquiries per 10 minutes per IP
        if (!RateLimiter::check("contact_ip_{$ip}", 3, 600)) {
            throw new RuntimeException("You have submitted several inquiries recently. Please check your email or wait a few minutes.", 429);
        }

        $referenceNumber = self::generateTicketNumber();
        $inquiryId = 'inq-' . bin2hex(random_bytes(10));

        Database::transaction(function (PDO $pdo) use ($inquiryId, $referenceNumber, $name, $email, $phone, $service, $message, $ip) {
            $stmt = $pdo->prepare("
                INSERT INTO contact_inquiries (id, reference_number, name, email, phone, service, message, status, ip_address, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW(), NOW())
            ");
            $stmt->execute([$inquiryId, $referenceNumber, $name, $email, $phone, $service, $message, $ip]);

            // Audit log
            $stmtLog = $pdo->prepare("
                INSERT INTO audit_logs (id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, 'SUBMIT_PUBLIC_INQUIRY', 'contact_inquiries', ?, ?, 'Public contact desk submission', NOW())
            ");
            $logId = 'aud-' . bin2hex(random_bytes(10));
            $stmtLog->execute([$logId, $name, $email, $inquiryId, $ip]);
        });

        // Send acknowledgement email to customer
        try {
            $this->emailService->sendSupportAcknowledgement($email, $name, $referenceNumber, "Inquiry regarding " . ucfirst($service));
        } catch (\Throwable $e) {
            error_log("[SupportService] Acknowledgement dispatch failed: " . $e->getMessage());
        }

        // Send alert email to HambakTech staff
        try {
            $this->emailService->sendSupportStaffNotification($referenceNumber, $name, $email, "Inquiry: " . ucfirst($service), $message);
        } catch (\Throwable $e) {
            error_log("[SupportService] Staff alert dispatch failed: " . $e->getMessage());
        }

        return [
            'referenceNumber' => $referenceNumber,
            'message'         => "Your message has been registered successfully. Reference number: {$referenceNumber}. An email confirmation has been dispatched.",
        ];
    }

    /**
     * Creates an authenticated user support ticket.
     */
    public function createTicket(array $user, string $subject, string $message, string $category = 'TECHNICAL', string $priority = 'MEDIUM'): array
    {
        $subject = Security::sanitizeString($subject);
        $message = trim($message);
        $ticketNumber = self::generateTicketNumber();
        $ticketId = 'tkt-' . bin2hex(random_bytes(10));
        $msgId = 'msg-' . bin2hex(random_bytes(10));

        Database::transaction(function (PDO $pdo) use ($ticketId, $ticketNumber, $user, $category, $subject, $priority, $msgId, $message) {
            $stmt = $pdo->prepare("
                INSERT INTO support_tickets (id, ticket_number, user_id, category, subject, priority, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'OPEN', NOW(), NOW())
            ");
            $stmt->execute([$ticketId, $ticketNumber, $user['id'], $category, $subject, $priority]);

            $stmtMsg = $pdo->prepare("
                INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_name, sender_role, content, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $senderName = trim(($user['firstName'] ?? '') . ' ' . ($user['lastName'] ?? ''));
            $stmtMsg->execute([$msgId, $ticketId, $user['id'], $senderName ?: 'Customer', $user['role'], $message]);
        });

        // Email customer and staff
        $name = trim(($user['firstName'] ?? '') . ' ' . ($user['lastName'] ?? ''));
        try {
            $this->emailService->sendSupportAcknowledgement($user['email'], $name ?: 'Customer', $ticketNumber, $subject);
            $this->emailService->sendSupportStaffNotification($ticketNumber, $name ?: 'Customer', $user['email'], $subject, $message);
        } catch (\Throwable $e) {
            error_log("[SupportService] Email alerts failed: " . $e->getMessage());
        }

        return [
            'ticketId'     => $ticketId,
            'ticketNumber' => $ticketNumber,
            'subject'      => $subject,
            'status'       => 'OPEN',
        ];
    }

    /**
     * Appends a message to a ticket (customer or staff reply).
     */
    public function replyTicket(string $ticketId, array $senderUser, string $content): array
    {
        $content = trim($content);
        if (empty($content)) {
            throw new RuntimeException("Reply content cannot be empty.", 400);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT t.id, t.ticket_number, t.subject, t.user_id, t.status,
                   u.email AS customer_email, p.first_name, p.last_name
            FROM support_tickets t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE t.id = ? OR t.ticket_number = ?
            LIMIT 1
        ");
        $stmt->execute([$ticketId, $ticketId]);
        $ticket = $stmt->fetch();

        if (!$ticket) {
            throw new RuntimeException("Support ticket not found.", 404);
        }

        $isStaff = in_array($senderUser['role'], ['super_admin', 'admin', 'staff'], true);
        if (!$isStaff && $ticket['user_id'] !== $senderUser['id']) {
            throw new RuntimeException("You do not have permission to view or reply to this ticket.", 403);
        }

        $msgId = 'msg-' . bin2hex(random_bytes(10));
        $senderName = trim(($senderUser['firstName'] ?? '') . ' ' . ($senderUser['lastName'] ?? ''));
        $senderRole = $isStaff ? 'staff' : 'customer';
        $newStatus = $isStaff ? 'WAITING_ON_CUSTOMER' : 'IN_PROGRESS';

        Database::transaction(function (PDO $pdo) use ($msgId, $ticket, $senderUser, $senderName, $senderRole, $content, $newStatus) {
            $stmtMsg = $pdo->prepare("
                INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_name, sender_role, content, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmtMsg->execute([$msgId, $ticket['id'], $senderUser['id'], $senderName, $senderRole, $content]);

            $stmtUp = $pdo->prepare("UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmtUp->execute([$newStatus, $ticket['id']]);
        });

        // If staff replied, notify customer via email
        if ($isStaff && !empty($ticket['customer_email'])) {
            $customerName = trim(($ticket['first_name'] ?? '') . ' ' . ($ticket['last_name'] ?? '')) ?: 'Valued Customer';
            try {
                $this->emailService->sendSupportReply($ticket['customer_email'], $customerName, $ticket['ticket_number'], $content);
            } catch (\Throwable $e) {
                error_log("[SupportService] Reply email dispatch failed: " . $e->getMessage());
            }
        }

        return [
            'messageId' => $msgId,
            'status'    => $newStatus,
            'content'   => $content,
        ];
    }
}
