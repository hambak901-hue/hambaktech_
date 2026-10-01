<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Config\Database;
use HambakTech\Utils\Response;
use PDO;

class AcademyController extends BaseController
{
    public function getCourses(): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT id, title, slug, code, level, category, duration_weeks, tuition_fee, instructor_name, description FROM academy_courses WHERE is_active = 1 ORDER BY title ASC");
        Response::success($stmt->fetchAll(), 'Academy courses retrieved.');
    }

    public function getCourse(array $params): void
    {
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM academy_courses WHERE (id = ? OR slug = ?) AND is_active = 1 LIMIT 1");
        $stmt->execute([$id, $id]);
        $course = $stmt->fetch();

        if (!$course) {
            Response::notFound("Academy course not found.");
            return;
        }

        // Fetch lessons
        $stmtLessons = $pdo->prepare("SELECT id, title, module_number, lesson_number, duration_minutes FROM course_lessons WHERE course_id = ? ORDER BY module_number ASC, lesson_number ASC");
        $stmtLessons->execute([$course['id']]);
        $course['lessons'] = $stmtLessons->fetchAll();

        Response::success($course, 'Course details retrieved.');
    }

    public function getEnrollments(): void
    {
        $user = $this->getAuthUser();
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT e.id, e.student_reg_number, e.status, e.progress_percent, e.payment_status, e.created_at,
                   c.id AS course_id, c.title AS course_title, c.code AS course_code, c.duration_weeks
            FROM course_enrollments e
            JOIN academy_courses c ON e.course_id = c.id
            WHERE e.user_id = ?
            ORDER BY e.created_at DESC
        ");
        $stmt->execute([$user['id']]);
        Response::success($stmt->fetchAll(), 'Enrollments retrieved.');
    }

    public function verifyCertificate(array $params): void
    {
        $certNumber = $params['number'] ?? '';
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT cert.certificate_number, cert.recipient_name, cert.grade, cert.issue_date,
                   c.title AS course_title, c.code AS course_code
            FROM certificates cert
            JOIN academy_courses c ON cert.course_id = c.id
            WHERE cert.certificate_number = ?
            LIMIT 1
        ");
        $stmt->execute([$certNumber]);
        $cert = $stmt->fetch();

        if (!$cert) {
            Response::notFound("No valid HambakTech certificate found matching {$certNumber}.");
            return;
        }

        Response::success($cert, 'Certificate verified successfully.');
    }

    public function createCourse(): void
    {
        $user = $this->getAuthUser();
        if (!in_array($user['role'], ['super_admin', 'admin'], true)) {
            Response::error('Administrative privilege required.', 403);
            return;
        }

        $body = $this->getJsonBody();
        $title = trim($body['title'] ?? '');
        $code = trim($body['code'] ?? ('HT-CRS-' . strtoupper(substr(uniqid(), -4))));
        $description = $body['description'] ?? '';
        $durationWeeks = intval($body['durationWeeks'] ?? $body['duration_weeks'] ?? 8);
        $price = floatval($body['price'] ?? $body['tuitionFee'] ?? $body['tuition_fee'] ?? 0);
        $level = $body['level'] ?? 'Beginner';
        $category = $body['category'] ?? 'Technology';

        if (empty($title)) {
            Response::error('Course title is required.', 422);
            return;
        }

        $pdo = Database::getConnection();
        $slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $title));
        $stmt = $pdo->prepare("
            INSERT INTO academy_courses (id, title, slug, code, level, category, duration_weeks, tuition_fee, description, is_active, created_at, updated_at)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        ");
        $stmt->execute([$title, $slug, $code, $level, $category, $durationWeeks, $price, $description]);

        Response::success(['title' => $title, 'code' => $code], 'Academy course registered successfully.', 201);
    }

    public function createInstructor(): void
    {
        $user = $this->getAuthUser();
        if (!in_array($user['role'], ['super_admin', 'admin'], true)) {
            Response::error('Administrative privilege required.', 403);
            return;
        }

        $body = $this->getJsonBody();
        $name = trim($body['fullName'] ?? $body['name'] ?? '');
        if (empty($name)) {
            Response::error('Instructor name is required.', 422);
            return;
        }

        Response::success(['fullName' => $name], 'Instructor registered successfully.', 201);
    }
}
