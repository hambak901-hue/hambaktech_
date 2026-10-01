<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Config\Database;
use HambakTech\Services\OrderService;
use HambakTech\Services\WalletService;
use HambakTech\Utils\Response;
use PDO;
use RuntimeException;

class IdentityController extends BaseController
{
    private OrderService $orderService;
    private WalletService $walletService;

    private const NIN_SERVICES = [
        'PLASTIC_CARD' => ['title' => 'Plastic PVC ID Card Printing', 'price' => 2500.0],
        'SLIP_RETRIEVAL' => ['title' => 'NIN Slip Retrieval & Color Reprint', 'price' => 1500.0],
        'MODIFICATION_GUIDANCE' => ['title' => 'Data Modification Guidance (DOB/Name)', 'price' => 3000.0],
        'HARMONIZATION_CHECK' => ['title' => 'BVN - NIN Harmonization Pre-check', 'price' => 1000.0],
    ];

    private const CAC_SERVICES = [
        'BUSINESS_NAME' => ['title' => 'Business Name Registration (BN/Sole Proprietorship)', 'price' => 25000.0],
        'COMPANY_LTD' => ['title' => 'Private Limited Company (LTD)', 'price' => 65000.0],
        'PRIVATE_LIMITED_COMPANY' => ['title' => 'Private Limited Company (LTD)', 'price' => 65000.0],
        'INCORPORATED_TRUSTEES' => ['title' => 'Incorporated Trustees / Non-Profit (NGO)', 'price' => 110000.0],
        'LIMITED_LIABILITY_PARTNERSHIP' => ['title' => 'Limited Liability Partnership (LLP)', 'price' => 65000.0],
    ];

    public function __construct(?OrderService $orderService = null, ?WalletService $walletService = null)
    {
        parent::__construct();
        $this->orderService = $orderService ?? new OrderService();
        $this->walletService = $walletService ?? new WalletService();
    }

    // ==========================================
    // NIN REQUESTS
    // ==========================================

    public function listNINRequests(): void
    {
        $user = $this->getAuthUser();
        $isStaff = $this->isStaff($user);

        $pdo = Database::getConnection();
        if ($isStaff && isset($_GET['all']) && $_GET['all'] === 'true') {
            $stmt = $pdo->query("SELECT * FROM nin_requests ORDER BY created_at DESC LIMIT 100");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM nin_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 100");
            $stmt->execute([$user['id']]);
        }

        $rows = $stmt->fetchAll();
        $results = array_map([$this, 'formatNINRecord'], $rows);
        Response::success($results, 'NIN requests retrieved.');
    }

    public function getNINRequest(array $params): void
    {
        $user = $this->getAuthUser();
        $id = $params['id'] ?? '';
        $isStaff = $this->isStaff($user);

        $pdo = Database::getConnection();
        if ($isStaff) {
            $stmt = $pdo->prepare("SELECT * FROM nin_requests WHERE id = ? OR reference = ? OR tracking_id = ? LIMIT 1");
            $stmt->execute([$id, $id, $id]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM nin_requests WHERE (id = ? OR reference = ? OR tracking_id = ?) AND user_id = ? LIMIT 1");
            $stmt->execute([$id, $id, $id, $user['id']]);
        }

        $row = $stmt->fetch();
        if (!$row) {
            Response::notFound("NIN request record not found or access denied.");
            return;
        }

        Response::success($this->formatNINRecord($row), 'NIN request retrieved.');
    }

    public function createNINRequest(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();

        $serviceType = strtoupper(trim((string)($body['serviceType'] ?? $body['service_type'] ?? 'PLASTIC_CARD')));
        $applicantName = trim((string)($body['applicantName'] ?? $body['applicant_name'] ?? ''));
        $phone = trim((string)($body['phone'] ?? ''));
        $ninNumber = trim((string)($body['ninNumber'] ?? $body['nin_number'] ?? ''));
        $deliveryType = strtoupper(trim((string)($body['deliveryType'] ?? $body['delivery_type'] ?? 'PICKUP')));
        $userNotes = trim((string)($body['notes'] ?? ''));

        if (empty($applicantName) || empty($phone)) {
            Response::error('Applicant name and contact phone number are required.', 400, 'VALIDATION_ERROR');
            return;
        }

        if (!isset(self::NIN_SERVICES[$serviceType])) {
            Response::error('Invalid NIN service type selected.', 400, 'INVALID_SERVICE');
            return;
        }

        $serviceConfig = self::NIN_SERVICES[$serviceType];
        $authoritativePrice = $serviceConfig['price'];
        $title = "NIN Service - " . $serviceConfig['title'];

        // Atomic transaction: Debit wallet + Insert Order + Insert NIN Request
        $record = Database::transaction(function (PDO $pdo) use ($user, $serviceType, $serviceConfig, $authoritativePrice, $title, $applicantName, $phone, $ninNumber, $deliveryType, $userNotes) {
            $referenceNumber = 'NIN-' . strtoupper(bin2hex(random_bytes(4)));
            $id = 'nin-' . bin2hex(random_bytes(10));

            // 1. Authoritative wallet debit
            $this->walletService->debit(
                $user['id'],
                $authoritativePrice,
                $referenceNumber,
                'NIN_SERVICE',
                "Payment for {$title} ({$referenceNumber})"
            );

            // 2. Insert order in orders table
            $orderId = 'ord-' . bin2hex(random_bytes(10));
            $stmtOrder = $pdo->prepare("
                INSERT INTO orders (id, order_number, user_id, service_code, title, total_amount, discount_amount, status, payment_status, payment_method, metadata, created_at, updated_at)
                VALUES (?, ?, ?, 'NIN', ?, ?, 0.00, 'PROCESSING', 'PAID', 'WALLET', ?, NOW(), NOW())
            ");
            $metaJson = json_encode([
                'ninReference' => $referenceNumber,
                'applicantName' => $applicantName,
                'phone' => $phone,
                'deliveryType' => $deliveryType,
            ]);
            $stmtOrder->execute([$orderId, $referenceNumber, $user['id'], $title, $authoritativePrice, $metaJson]);

            // 3. Metadata packing into notes JSON
            $payloadMeta = [
                'applicantName' => $applicantName,
                'phone'         => $phone,
                'deliveryType'  => $deliveryType,
                'amount'        => $authoritativePrice,
                'userNotes'     => $userNotes,
            ];
            $notesJson = json_encode($payloadMeta);

            // 4. Insert into nin_requests
            $stmtNIN = $pdo->prepare("
                INSERT INTO nin_requests (id, reference, user_id, nin_number, tracking_id, service_type, status, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW(), NOW())
            ");
            $maskedNIN = !empty($ninNumber) ? substr($ninNumber, 0, 4) . '***' . substr($ninNumber, -2) : null;
            $stmtNIN->execute([$id, $referenceNumber, $user['id'], $maskedNIN, $referenceNumber, $serviceType, $notesJson]);

            // Update user_profiles.nin_last4 if NIN was provided
            if (!empty($ninNumber) && strlen($ninNumber) >= 4) {
                $ninLast4 = substr($ninNumber, -4);
                $pdo->prepare("UPDATE user_profiles SET nin_last4 = COALESCE(?, nin_last4), updated_at = NOW() WHERE user_id = ?")->execute([$ninLast4, $user['id']]);
            }

            // 5. Audit log
            $auditId = 'aud-' . bin2hex(random_bytes(10));
            $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'NIN_SERVICE_REQUEST_CREATED', 'NIN_REQUEST', ?, ?, ?, NOW())
            ")->execute([
                $auditId,
                $user['id'],
                $user['firstName'] ?? $user['name'] ?? 'Customer',
                $user['email'] ?? 'customer@hambaktech.com.ng',
                $id,
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                json_encode([
                    'reference'   => $referenceNumber,
                    'serviceType' => $serviceType,
                    'amount'      => $authoritativePrice,
                    'maskedNin'   => $maskedNIN,
                ]),
            ]);

            return [
                'id'              => $id,
                'referenceNumber' => $referenceNumber,
                'serviceType'     => $serviceType,
                'applicantName'   => $applicantName,
                'ninNumber'       => $maskedNIN,
                'phone'           => $phone,
                'deliveryType'    => $deliveryType,
                'status'          => 'PENDING',
                'amount'          => $authoritativePrice,
                'notes'           => $userNotes,
                'createdAt'       => date('c'),
                'updatedAt'       => date('c'),
            ];
        });

        Response::success($record, 'NIN service request submitted successfully.', 201);
    }

    public function trackNIN(array $params): void
    {
        $ref = trim($params['ref'] ?? $_GET['ref'] ?? '');
        if (empty($ref)) {
            Response::error('Tracking reference required.', 400);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM nin_requests WHERE reference = ? OR tracking_id = ? OR id = ? LIMIT 1");
        $stmt->execute([$ref, $ref, $ref]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::notFound("No active NIN application found for reference {$ref}.");
            return;
        }

        $data = $this->formatNINRecord($row);
        Response::success($data, 'NIN status tracking retrieved.');
    }

    // ==========================================
    // CAC REQUESTS
    // ==========================================

    public function listCACRequests(): void
    {
        $user = $this->getAuthUser();
        $isStaff = $this->isStaff($user);

        $pdo = Database::getConnection();
        if ($isStaff && isset($_GET['all']) && $_GET['all'] === 'true') {
            $stmt = $pdo->query("SELECT * FROM cac_requests ORDER BY created_at DESC LIMIT 100");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM cac_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 100");
            $stmt->execute([$user['id']]);
        }

        $rows = $stmt->fetchAll();
        $results = array_map([$this, 'formatCACRecord'], $rows);
        Response::success($results, 'CAC filings retrieved.');
    }

    public function getCACRequest(array $params): void
    {
        $user = $this->getAuthUser();
        $id = $params['id'] ?? '';
        $isStaff = $this->isStaff($user);

        $pdo = Database::getConnection();
        if ($isStaff) {
            $stmt = $pdo->prepare("SELECT * FROM cac_requests WHERE id = ? OR reference = ? LIMIT 1");
            $stmt->execute([$id, $id]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM cac_requests WHERE (id = ? OR reference = ?) AND user_id = ? LIMIT 1");
            $stmt->execute([$id, $id, $user['id']]);
        }

        $row = $stmt->fetch();
        if (!$row) {
            Response::notFound("CAC filing record not found or access denied.");
            return;
        }

        Response::success($this->formatCACRecord($row), 'CAC filing retrieved.');
    }

    public function createCACRequest(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();

        $regType = strtoupper(trim((string)($body['registrationType'] ?? $body['registration_type'] ?? $body['business_type'] ?? 'BUSINESS_NAME')));
        $name1 = trim((string)($body['proposedName1'] ?? $body['proposed_name1'] ?? ''));
        $name2 = trim((string)($body['proposedName2'] ?? $body['proposed_name2'] ?? ''));
        $nature = trim((string)($body['natureOfBusiness'] ?? $body['nature_of_business'] ?? ''));
        $proprietorName = trim((string)($body['proprietorName'] ?? $body['proprietor_name'] ?? $body['applicant_name'] ?? ''));
        $proprietorPhone = trim((string)($body['proprietorPhone'] ?? $body['proprietor_phone'] ?? $body['applicant_phone'] ?? ''));
        $proprietorEmail = trim((string)($body['proprietorEmail'] ?? $body['proprietor_email'] ?? $body['applicant_email'] ?? ''));
        $address = trim((string)($body['businessAddress'] ?? $body['business_address'] ?? ''));
        $userNotes = trim((string)($body['notes'] ?? ''));

        if (empty($name1) || empty($nature) || empty($proprietorName) || empty($proprietorPhone)) {
            Response::error('Proposed name, business nature, and proprietor contact details are required.', 400, 'VALIDATION_ERROR');
            return;
        }

        if (!isset(self::CAC_SERVICES[$regType])) {
            Response::error('Invalid CAC registration type selected.', 400, 'INVALID_SERVICE');
            return;
        }

        $serviceConfig = self::CAC_SERVICES[$regType];
        $authoritativePrice = $serviceConfig['price'];
        $title = "CAC Filing - " . $serviceConfig['title'];

        $record = Database::transaction(function (PDO $pdo) use ($user, $regType, $serviceConfig, $authoritativePrice, $title, $name1, $name2, $nature, $proprietorName, $proprietorPhone, $proprietorEmail, $address, $userNotes) {
            $referenceNumber = 'CAC-' . strtoupper(bin2hex(random_bytes(4)));
            $id = 'cac-' . bin2hex(random_bytes(10));

            // 1. Authoritative wallet debit
            $this->walletService->debit(
                $user['id'],
                $authoritativePrice,
                $referenceNumber,
                'CAC_FILING',
                "Payment for {$title} ({$referenceNumber})"
            );

            // 2. Insert order
            $orderId = 'ord-' . bin2hex(random_bytes(10));
            $stmtOrder = $pdo->prepare("
                INSERT INTO orders (id, order_number, user_id, service_code, title, total_amount, discount_amount, status, payment_status, payment_method, metadata, created_at, updated_at)
                VALUES (?, ?, ?, 'CAC', ?, ?, 0.00, 'PROCESSING', 'PAID', 'WALLET', ?, NOW(), NOW())
            ");
            $metaJson = json_encode([
                'cacReference'   => $referenceNumber,
                'proposedName1'  => $name1,
                'proprietorName' => $proprietorName,
            ]);
            $stmtOrder->execute([$orderId, $referenceNumber, $user['id'], $title, $authoritativePrice, $metaJson]);

            // 3. Notes metadata payload
            $metaPayload = [
                'natureOfBusiness' => $nature,
                'proprietorName'   => $proprietorName,
                'proprietorPhone'  => $proprietorPhone,
                'proprietorEmail'  => $proprietorEmail,
                'businessAddress'  => $address,
                'amount'           => $authoritativePrice,
                'userNotes'        => $userNotes,
            ];
            $notesJson = json_encode($metaPayload);

            // 4. Insert into cac_requests
            $stmtCAC = $pdo->prepare("
                INSERT INTO cac_requests (id, reference, user_id, proposed_name1, proposed_name2, business_type, status, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED', ?, NOW(), NOW())
            ");
            $stmtCAC->execute([$id, $referenceNumber, $user['id'], $name1, !empty($name2) ? $name2 : null, $regType, $notesJson]);

            // 5. Audit log
            $auditId = 'aud-' . bin2hex(random_bytes(10));
            $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'CAC_SERVICE_REQUEST_CREATED', 'CAC_REQUEST', ?, ?, ?, NOW())
            ")->execute([
                $auditId,
                $user['id'],
                $user['firstName'] ?? $user['name'] ?? 'Customer',
                $user['email'] ?? 'customer@hambaktech.com.ng',
                $id,
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                json_encode([
                    'reference'    => $referenceNumber,
                    'businessType' => $regType,
                    'amount'       => $authoritativePrice,
                    'proposedName' => $name1,
                ]),
            ]);

            return [
                'id'               => $id,
                'referenceNumber'  => $referenceNumber,
                'registrationType' => $regType,
                'proposedName1'    => $name1,
                'proposedName2'    => $name2,
                'natureOfBusiness' => $nature,
                'proprietorName'   => $proprietorName,
                'proprietorPhone'  => $proprietorPhone,
                'proprietorEmail'  => $proprietorEmail,
                'businessAddress'  => $address,
                'status'           => 'SUBMITTED',
                'amount'           => $authoritativePrice,
                'notes'            => $userNotes,
                'createdAt'        => date('c'),
                'updatedAt'        => date('c'),
            ];
        });

        Response::success($record, 'CAC incorporation application submitted successfully.', 201);
    }

    public function trackCAC(array $params): void
    {
        $ref = trim($params['ref'] ?? $_GET['ref'] ?? '');
        if (empty($ref)) {
            Response::error('Tracking reference required.', 400);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM cac_requests WHERE reference = ? OR id = ? LIMIT 1");
        $stmt->execute([$ref, $ref]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::notFound("No active CAC filing found for reference {$ref}.");
            return;
        }

        $data = $this->formatCACRecord($row);
        Response::success($data, 'CAC status tracking retrieved.');
    }

    // ==========================================
    // HELPERS
    // ==========================================

    private function formatNINRecord(array $row): array
    {
        $meta = [];
        if (!empty($row['notes'])) {
            $decoded = json_decode((string)$row['notes'], true);
            if (is_array($decoded)) {
                $meta = $decoded;
            }
        }

        return [
            'id'              => $row['id'],
            'referenceNumber' => $row['reference'],
            'serviceType'     => $row['service_type'],
            'applicantName'   => $meta['applicantName'] ?? 'HAMBakTECH Applicant',
            'ninNumber'       => $row['nin_number'] ?? null,
            'phone'           => $meta['phone'] ?? 'N/A',
            'deliveryType'    => $meta['deliveryType'] ?? 'PICKUP',
            'status'          => $row['status'],
            'amount'          => (float)($meta['amount'] ?? 2500.0),
            'notes'           => $meta['userNotes'] ?? $row['notes'] ?? '',
            'createdAt'       => $row['created_at'],
            'updatedAt'       => $row['updated_at'],
        ];
    }

    private function formatCACRecord(array $row): array
    {
        $meta = [];
        if (!empty($row['notes'])) {
            $decoded = json_decode((string)$row['notes'], true);
            if (is_array($decoded)) {
                $meta = $decoded;
            }
        }

        return [
            'id'               => $row['id'],
            'referenceNumber'  => $row['reference'],
            'registrationType' => $row['business_type'],
            'proposedName1'    => $row['proposed_name1'],
            'proposedName2'    => $row['proposed_name2'] ?? null,
            'natureOfBusiness' => $meta['natureOfBusiness'] ?? 'General Digital & Enterprise Services',
            'proprietorName'   => $meta['proprietorName'] ?? 'Applicant',
            'proprietorPhone'  => $meta['proprietorPhone'] ?? 'N/A',
            'proprietorEmail'  => $meta['proprietorEmail'] ?? null,
            'businessAddress'  => $meta['businessAddress'] ?? null,
            'status'           => $row['status'],
            'amount'           => (float)($meta['amount'] ?? 25000.0),
            'notes'            => $meta['userNotes'] ?? $row['notes'] ?? '',
            'createdAt'        => $row['created_at'],
            'updatedAt'        => $row['updated_at'],
        ];
    }

    // ==========================================
    // BVN VERIFICATION & HARMONIZATION
    // ==========================================

    public function listBVNRequests(): void
    {
        $user = $this->getAuthUser();
        $isStaff = $this->isStaff($user);

        $pdo = Database::getConnection();
        if ($isStaff && isset($_GET['all']) && $_GET['all'] === 'true') {
            $stmt = $pdo->query("SELECT * FROM nin_requests WHERE service_type IN ('HARMONIZATION_CHECK', 'BVN_VERIFICATION') ORDER BY created_at DESC LIMIT 100");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM nin_requests WHERE user_id = ? AND service_type IN ('HARMONIZATION_CHECK', 'BVN_VERIFICATION') ORDER BY created_at DESC LIMIT 100");
            $stmt->execute([$user['id']]);
        }

        $rows = $stmt->fetchAll();
        $results = array_map([$this, 'formatBVNRecord'], $rows);
        Response::success($results, 'BVN requests retrieved.');
    }

    public function getBVNRequest(array $params): void
    {
        $user = $this->getAuthUser();
        $id = $params['id'] ?? '';
        $isStaff = $this->isStaff($user);

        $pdo = Database::getConnection();
        if ($isStaff) {
            $stmt = $pdo->prepare("SELECT * FROM nin_requests WHERE (id = ? OR reference = ? OR tracking_id = ?) AND service_type IN ('HARMONIZATION_CHECK', 'BVN_VERIFICATION') LIMIT 1");
            $stmt->execute([$id, $id, $id]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM nin_requests WHERE (id = ? OR reference = ? OR tracking_id = ?) AND user_id = ? AND service_type IN ('HARMONIZATION_CHECK', 'BVN_VERIFICATION') LIMIT 1");
            $stmt->execute([$id, $id, $id, $user['id']]);
        }

        $row = $stmt->fetch();
        if (!$row) {
            Response::notFound("BVN request record not found or access denied.");
            return;
        }

        Response::success($this->formatBVNRecord($row), 'BVN request retrieved.');
    }

    public function createBVNRequest(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();

        $fullName = trim((string)($body['fullName'] ?? $body['full_name'] ?? ''));
        $bankName = trim((string)($body['bankName'] ?? $body['bank_name'] ?? ''));
        $phone = trim((string)($body['phone'] ?? ''));
        $bvn = trim((string)($body['bvn'] ?? ''));
        $dob = trim((string)($body['dateOfBirth'] ?? $body['dob'] ?? ''));
        $consent = !empty($body['consent']);
        $serviceType = strtoupper(trim((string)($body['serviceType'] ?? 'HARMONIZATION_CHECK')));

        if (empty($fullName) || empty($bankName) || empty($phone) || empty($bvn)) {
            Response::error('Full name, bank name, phone, and BVN are required.', 400, 'VALIDATION_ERROR');
            return;
        }

        if (!preg_match('/^\d{11}$/', $bvn)) {
            Response::error('BVN must be exactly 11 digits.', 400, 'INVALID_BVN_FORMAT');
            return;
        }

        if (!$consent) {
            Response::error('Explicit customer consent is required for identity verification under NDPR guidelines.', 400, 'CONSENT_REQUIRED');
            return;
        }

        $authoritativePrice = ($serviceType === 'HARMONIZATION_CHECK') ? 1000.0 : 0.0;
        $title = "BVN Harmonization Pre-check";

        $record = Database::transaction(function (PDO $pdo) use ($user, $fullName, $bankName, $phone, $bvn, $dob, $authoritativePrice, $title) {
            $referenceNumber = 'BVN-' . strtoupper(bin2hex(random_bytes(4)));
            $id = 'bvn-' . bin2hex(random_bytes(10));
            $bvnLast4 = substr($bvn, -4);
            $maskedBVN = substr($bvn, 0, 4) . '***' . substr($bvn, -2);

            // 1. Authoritative wallet debit if fee > 0
            if ($authoritativePrice > 0) {
                $this->walletService->debit(
                    $user['id'],
                    $authoritativePrice,
                    $referenceNumber,
                    'BVN_SERVICE',
                    "Payment for {$title} ({$referenceNumber})"
                );

                // Insert into orders
                $orderId = 'ord-' . bin2hex(random_bytes(10));
                $stmtOrder = $pdo->prepare("
                    INSERT INTO orders (id, order_number, user_id, service_code, title, total_amount, discount_amount, status, payment_status, payment_method, metadata, created_at, updated_at)
                    VALUES (?, ?, ?, 'BVN', ?, ?, 0.00, 'PROCESSING', 'PAID', 'WALLET', ?, NOW(), NOW())
                ");
                $stmtOrder->execute([$orderId, $referenceNumber, $user['id'], $title, $authoritativePrice, json_encode([
                    'bvnReference' => $referenceNumber,
                    'bvnLast4'     => $bvnLast4,
                    'bankName'     => $bankName,
                ])]);
            }

            // 2. Insert into nin_requests with service_type 'HARMONIZATION_CHECK'
            $notesPayload = [
                'fullName'    => $fullName,
                'bankName'    => $bankName,
                'phone'       => $phone,
                'dateOfBirth' => $dob,
                'bvnLast4'    => $bvnLast4,
                'maskedBvn'   => $maskedBVN,
                'consent'     => true,
                'amount'      => $authoritativePrice,
            ];
            $stmt = $pdo->prepare("
                INSERT INTO nin_requests (id, reference, user_id, nin_number, tracking_id, service_type, status, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'HARMONIZATION_CHECK', 'PENDING', ?, NOW(), NOW())
            ");
            $stmt->execute([$id, $referenceNumber, $user['id'], $bvnLast4, $referenceNumber, json_encode($notesPayload)]);

            // 3. Update user_profiles.bvn_last4
            $pdo->prepare("UPDATE user_profiles SET bvn_last4 = COALESCE(?, bvn_last4), updated_at = NOW() WHERE user_id = ?")->execute([$bvnLast4, $user['id']]);

            // 4. Audit log with canonical 'entity'
            $auditId = 'aud-' . bin2hex(random_bytes(10));
            $pdo->prepare("
                INSERT INTO audit_logs (id, user_id, actor_name, actor_email, action, entity, entity_id, ip_address, details, created_at)
                VALUES (?, ?, ?, ?, 'BVN_HARMONIZATION_REQUEST_CREATED', 'BVN_REQUEST', ?, ?, ?, NOW())
            ")->execute([
                $auditId,
                $user['id'],
                $user['firstName'] ?? $user['name'] ?? 'Customer',
                $user['email'] ?? 'customer@hambaktech.com.ng',
                $id,
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                json_encode([
                    'reference' => $referenceNumber,
                    'bvnLast4'  => $bvnLast4,
                    'bankName'  => $bankName,
                    'amount'    => $authoritativePrice,
                ]),
            ]);

            return [
                'id'              => $id,
                'referenceNumber' => $referenceNumber,
                'serviceType'     => 'HARMONIZATION_CHECK',
                'fullName'        => $fullName,
                'bvnLast4'        => $bvnLast4,
                'maskedBvn'       => $maskedBVN,
                'bankName'        => $bankName,
                'phone'           => $phone,
                'status'          => 'PENDING',
                'amount'          => $authoritativePrice,
                'createdAt'       => date('c'),
            ];
        });

        Response::success($record, 'BVN Harmonization request submitted successfully.', 201);
    }

    private function formatBVNRecord(array $row): array
    {
        $meta = [];
        if (!empty($row['notes'])) {
            $decoded = json_decode((string)$row['notes'], true);
            if (is_array($decoded)) {
                $meta = $decoded;
            }
        }

        return [
            'id'              => $row['id'],
            'referenceNumber' => $row['reference'],
            'serviceType'     => $row['service_type'],
            'fullName'        => $meta['fullName'] ?? 'Customer',
            'bankName'        => $meta['bankName'] ?? 'N/A',
            'bvnLast4'        => $meta['bvnLast4'] ?? $row['nin_number'] ?? null,
            'maskedBvn'       => $meta['maskedBvn'] ?? (!empty($row['nin_number']) ? '***' . $row['nin_number'] : null),
            'phone'           => $meta['phone'] ?? 'N/A',
            'status'          => $row['status'],
            'amount'          => (float)($meta['amount'] ?? 1000.0),
            'createdAt'       => $row['created_at'],
            'updatedAt'       => $row['updated_at'],
        ];
    }
}
