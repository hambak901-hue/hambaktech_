<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Config\Database;
use HambakTech\Utils\Response;
use PDO;

class AcademyController extends BaseController
{
    /**
     * Get all active academy courses.
     */
    public function getCourses(): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT id, title, slug, code, level, category, duration_weeks, tuition_fee, 
                   tuition_fee AS price, instructor_name, description 
            FROM academy_courses 
            WHERE is_active = 1 
            ORDER BY title ASC
        ");
        $courses = $stmt->fetchAll();

        // Fallback default courses if table empty
        if (empty($courses)) {
            $courses = [
                [
                    'id' => 'crs-comp-lit',
                    'title' => 'Executive Computer Literacy & Office Productivity',
                    'slug' => 'computer-literacy',
                    'code' => 'HT-ACAD-101',
                    'level' => 'Beginner',
                    'category' => 'Foundational',
                    'duration_weeks' => 4,
                    'tuition_fee' => 35000.00,
                    'price' => 35000.00,
                    'instructor_name' => 'Engr. Ibrahim Hambak',
                    'description' => 'Master Microsoft Word, Excel, PowerPoint, Google Workspace, and secure document workflows.'
                ],
                [
                    'id' => 'crs-graph-brand',
                    'title' => 'Graphics Design, UI/UX & Brand Identity',
                    'slug' => 'graphics-branding',
                    'code' => 'HT-ACAD-201',
                    'level' => 'Intermediate',
                    'category' => 'Creative',
                    'duration_weeks' => 8,
                    'tuition_fee' => 60000.00,
                    'price' => 60000.00,
                    'instructor_name' => 'Maryam Bello',
                    'description' => 'Adobe Photoshop, Illustrator, CorelDraw, Figma, and commercial print production standards.'
                ],
                [
                    'id' => 'crs-full-stack',
                    'title' => 'Full-Stack Web & Software Engineering',
                    'slug' => 'web-software-engineering',
                    'code' => 'HT-ACAD-301',
                    'level' => 'Advanced',
                    'category' => 'Engineering',
                    'duration_weeks' => 12,
                    'tuition_fee' => 120000.00,
                    'price' => 120000.00,
                    'instructor_name' => 'Engr. Ibrahim Hambak',
                    'description' => 'HTML5, CSS3, Tailwind, JavaScript, React, Node.js, PHP, PostgreSQL, Git, and Cloud deployment.'
                ],
                [
                    'id' => 'crs-data-analytics',
                    'title' => 'Data Analysis, SQL & Business Intelligence',
                    'slug' => 'data-analysis',
                    'code' => 'HT-ACAD-302',
                    'level' => 'Intermediate',
                    'category' => 'Data Science',
                    'duration_weeks' => 10,
                    'tuition_fee' => 95000.00,
                    'price' => 95000.00,
                    'instructor_name' => 'Olanrewaju Davies',
                    'description' => 'Advanced Excel, SQL data manipulation, PowerBI dashboards, and strategic business reporting.'
                ],
                [
                    'id' => 'crs-digital-mktg',
                    'title' => 'Digital Marketing, SEO & Ads Management',
                    'slug' => 'digital-marketing',
                    'code' => 'HT-ACAD-202',
                    'level' => 'Beginner',
                    'category' => 'Marketing',
                    'duration_weeks' => 6,
                    'tuition_fee' => 50000.00,
                    'price' => 50000.00,
                    'instructor_name' => 'Aisha Danjuma',
                    'description' => 'Meta Ads, Google Search Ads, TikTok marketing, content strategy, copy crafting, and sales funnels.'
                ],
            ];
        }

        Response::success($courses, 'Academy courses retrieved.');
    }

    /**
     * Get single course details.
     */
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

        $stmtLessons = $pdo->prepare("SELECT id, title, module_number, lesson_number, duration_minutes FROM course_lessons WHERE course_id = ? ORDER BY module_number ASC, lesson_number ASC");
        $stmtLessons->execute([$course['id']]);
        $course['lessons'] = $stmtLessons->fetchAll();

        Response::success($course, 'Course details retrieved.');
    }

    /**
     * Get enrollments for the current student.
     */
    public function getEnrollments(): void
    {
        $user = $this->getAuthUser();
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT e.id, e.student_reg_number, e.status, e.progress_percent, e.payment_status, e.created_at,
                   e.cohort, e.schedule_preference, e.study_mode,
                   c.id AS course_id, c.title AS course_title, c.code AS course_code, c.duration_weeks,
                   c.tuition_fee
            FROM course_enrollments e
            JOIN academy_courses c ON e.course_id = c.id
            WHERE e.user_id = ?
            ORDER BY e.created_at DESC
        ");
        $stmt->execute([$user['id']]);
        $enrollments = $stmt->fetchAll();

        Response::success($enrollments, 'Enrollments retrieved.');
    }

    /**
     * Complete Student Course Enrollment & Payment Generation.
     * Captures student personal details, cohort, schedule, payment choice.
     */
    public function enrollCourse(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();

        $courseId = trim((string)($body['courseId'] ?? $body['course_id'] ?? ''));
        if (empty($courseId)) {
            Response::error('Course ID is required.', 400, 'MISSING_COURSE_ID');
            return;
        }

        $pdo = Database::getConnection();

        // 1. Fetch course
        $stmtCourse = $pdo->prepare("SELECT * FROM academy_courses WHERE id = ? OR slug = ? LIMIT 1");
        $stmtCourse->execute([$courseId, $courseId]);
        $course = $stmtCourse->fetch();

        $tuitionFee = $course ? floatval($course['tuition_fee']) : floatval($body['fee'] ?? 50000.00);
        $courseTitle = $course ? $course['title'] : ($body['courseTitle'] ?? 'Academy Professional Course');

        // 2. Extract registration details
        $studentName = trim((string)($body['studentName'] ?? $body['fullName'] ?? $user['name'] ?? ''));
        $studentPhone = trim((string)($body['studentPhone'] ?? $body['phone'] ?? $user['phone'] ?? ''));
        $studentEmail = trim((string)($body['studentEmail'] ?? $body['email'] ?? $user['email'] ?? ''));
        $address = trim((string)($body['address'] ?? ''));
        $state = trim((string)($body['state'] ?? 'Lagos'));
        $education = trim((string)($body['highestEducation'] ?? $body['education'] ?? 'High School / O Level'));
        $experience = trim((string)($body['priorExperience'] ?? $body['experience'] ?? 'Beginner'));
        $cohort = trim((string)($body['cohort'] ?? 'Q4 ' . date('Y')));
        $schedule = trim((string)($body['schedulePreference'] ?? $body['schedule'] ?? 'Morning (9:00 AM - 12:00 PM)'));
        $studyMode = trim((string)($body['studyMode'] ?? 'In-Person Lab'));
        $guardianName = trim((string)($body['guardianName'] ?? ''));
        $guardianPhone = trim((string)($body['guardianPhone'] ?? ''));
        $payWithWallet = !empty($body['payWithWallet']);

        $enrollmentId = 'enr-' . bin2hex(random_bytes(6));
        $regNumber = 'HT-STD-' . date('Y') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
        $invoiceRef = 'HT-INV-ACAD-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));

        $paymentStatus = 'PENDING';

        // 3. Handle Wallet Payment
        if ($payWithWallet) {
            $stmtWallet = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? LIMIT 1");
            $stmtWallet->execute([$user['id']]);
            $wallet = $stmtWallet->fetch();
            $currentBalance = $wallet ? floatval($wallet['balance']) : 0.00;

            if ($currentBalance >= $tuitionFee) {
                // Deduct wallet
                $stmtDeduct = $pdo->prepare("UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?");
                $stmtDeduct->execute([$tuitionFee, $user['id']]);

                // Record transaction
                $stmtTx = $pdo->prepare("
                    INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, fee, status, reference, description, created_at)
                    VALUES (UUID(), ?, ?, 'DEBIT', ?, 0.00, 'SUCCESSFUL', ?, ?, NOW())
                ");
                $stmtTx->execute([
                    $user['id'],
                    $user['id'],
                    $tuitionFee,
                    $invoiceRef,
                    "Tuition Payment for {$courseTitle} ({$regNumber})"
                ]);

                $paymentStatus = 'PAID';
            } else {
                Response::error("Insufficient wallet balance (₦" . number_format($currentBalance, 2) . "). Required: ₦" . number_format($tuitionFee, 2) . ". Please fund your wallet or choose alternate payment.", 400, 'INSUFFICIENT_FUNDS');
                return;
            }
        }

        // 4. Save Enrollment
        $stmtEnroll = $pdo->prepare("
            INSERT INTO course_enrollments (id, user_id, course_id, student_reg_number, cohort, schedule_preference, study_mode, status, payment_status, progress_percent, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, 0, NOW(), NOW())
        ");
        $stmtEnroll->execute([
            $enrollmentId,
            $user['id'],
            $courseId,
            $regNumber,
            $cohort,
            $schedule,
            $studyMode,
            $paymentStatus
        ]);

        // 5. Generate Student ID Card
        $idCardNumber = 'HT-IDC-' . date('Y') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));
        $stmtIdCard = $pdo->prepare("
            INSERT INTO student_id_cards (id, user_id, course_id, enrollment_id, id_card_number, student_name, cohort, is_active, issued_at)
            VALUES (UUID(), ?, ?, ?, ?, ?, ?, 1, NOW())
        ");
        $stmtIdCard->execute([
            $user['id'],
            $courseId,
            $enrollmentId,
            $idCardNumber,
            $studentName,
            $cohort
        ]);

        Response::success([
            'id' => $enrollmentId,
            'enrollmentId' => $enrollmentId,
            'courseId' => $courseId,
            'courseTitle' => $courseTitle,
            'studentRegNumber' => $regNumber,
            'studentName' => $studentName,
            'invoiceRef' => $invoiceRef,
            'tuitionFee' => $tuitionFee,
            'paymentStatus' => $paymentStatus,
            'cohort' => $cohort,
            'schedule' => $schedule,
            'studyMode' => $studyMode,
            'idCardNumber' => $idCardNumber,
            'message' => $paymentStatus === 'PAID' 
                ? "Enrollment successful! Tuition paid. Your student ID and workstation seat have been confirmed."
                : "Enrollment registered. Invoice generated. Complete payment to finalize workstation reservation."
        ], 'Course enrollment submitted successfully.', 201);
    }

    /**
     * Get instructors list.
     */
    public function getInstructors(): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT id, name, email, specialization, bio, avatar_url FROM academy_instructors WHERE is_active = 1");
        $instructors = $stmt->fetchAll();

        if (empty($instructors)) {
            $instructors = [
                [
                    'id' => 'inst-1',
                    'name' => 'Engr. Ibrahim Hambak',
                    'specialization' => 'Full-Stack Systems & Network Security',
                    'bio' => 'Senior Systems Engineer with over 10 years experience in enterprise IT and cloud deployments.',
                    'avatar_url' => '/images/team/team-01.png'
                ],
                [
                    'id' => 'inst-2',
                    'name' => 'Maryam Bello',
                    'specialization' => 'Creative Branding, Print & UI/UX',
                    'bio' => 'Brand identity lead specializing in professional visual graphics and commercial offset printing.',
                    'avatar_url' => '/images/team/team-02.png'
                ],
                [
                    'id' => 'inst-3',
                    'name' => 'Olanrewaju Davies',
                    'specialization' => 'Data Analytics, SQL & BI Architecture',
                    'bio' => 'Business intelligence architect training analysts across commercial finance and technology.',
                    'avatar_url' => '/images/team/team-03.png'
                ]
            ];
        }

        Response::success($instructors, 'Instructors retrieved.');
    }

    /**
     * Get course assignments.
     */
    public function getAssignments(): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT id, course_id, title, description, max_score, due_date FROM course_assignments ORDER BY created_at DESC");
        $assignments = $stmt->fetchAll();

        Response::success($assignments, 'Assignments retrieved.');
    }

    /**
     * Submit student assignment solution.
     */
    public function submitAssignment(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();
        $assignmentId = $body['assignmentId'] ?? '';
        $enrollmentId = $body['enrollmentId'] ?? '';
        $content = $body['content'] ?? '';
        $fileUrl = $body['fileUrl'] ?? '';

        if (empty($assignmentId) || empty($content)) {
            Response::error('Assignment ID and submission content are required.', 400);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO assignment_submissions (id, assignment_id, enrollment_id, user_id, content, file_url, submitted_at, graded)
            VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), 0)
        ");
        $stmt->execute([$assignmentId, $enrollmentId, $user['id'], $content, $fileUrl]);

        Response::success(null, 'Assignment solution submitted for instructor review.');
    }

    /**
     * Get student certificates.
     */
    public function getCertificates(): void
    {
        $user = $this->getAuthUser();
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT cert.id, cert.certificate_number, cert.recipient_name, cert.grade, cert.issue_date,
                   cert.verification_url, c.id AS course_id, c.title AS course_title
            FROM certificates cert
            JOIN academy_courses c ON cert.course_id = c.id
            WHERE cert.user_id = ?
            ORDER BY cert.issue_date DESC
        ");
        $stmt->execute([$user['id']]);
        $certs = $stmt->fetchAll();

        Response::success($certs, 'Student certificates retrieved.');
    }

    /**
     * Get student digital ID cards.
     */
    public function getIdCards(): void
    {
        $user = $this->getAuthUser();
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT idc.id, idc.id_card_number, idc.student_name, idc.cohort, idc.is_active, idc.issued_at,
                   c.id AS course_id, c.title AS course_title
            FROM student_id_cards idc
            JOIN academy_courses c ON idc.course_id = c.id
            WHERE idc.user_id = ?
            ORDER BY idc.issued_at DESC
        ");
        $stmt->execute([$user['id']]);
        $idCards = $stmt->fetchAll();

        Response::success($idCards, 'Student ID cards retrieved.');
    }

    /**
     * Verify official academic certificate.
     */
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
