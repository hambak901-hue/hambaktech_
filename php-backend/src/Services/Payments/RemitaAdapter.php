<?php
declare(strict_types=1);

namespace HambakTech\Services\Payments;

use HambakTech\Config\Env;
use RuntimeException;

/**
 * Remita Payment Provider Adapter
 *
 * Implements Remita gateway integration.
 * In accordance with HambakTech financial integrity standards:
 * If the live API contract and production merchant credentials/configuration are not present,
 * it strictly returns CONFIGURATION_ERROR / BLOCKED — REMITA PRODUCTION CONFIGURATION REQUIRED.
 * Never creates fake success responses or fabricates status.
 */
class RemitaAdapter implements PaymentProviderInterface
{
    private string $merchantId;
    private string $apiKey;
    private string $serviceTypeId;
    private string $baseUrl;

    public function __construct(
        ?string $merchantId = null,
        ?string $apiKey = null,
        ?string $serviceTypeId = null,
        ?string $baseUrl = null
    ) {
        $this->merchantId = $merchantId ?? (string)Env::get('REMITA_MERCHANT_ID', '');
        $this->apiKey = $apiKey ?? (string)Env::get('REMITA_API_KEY', '');
        $this->serviceTypeId = $serviceTypeId ?? (string)Env::get('REMITA_SERVICE_TYPE_ID', '');
        $this->baseUrl = $baseUrl ?? (string)Env::get('REMITA_BASE_URL', 'https://remita.net/remita/exapp/api/v1/send/api');
    }

    public function getIdentifier(): string
    {
        return 'REMITA';
    }

    public function isConfigured(): bool
    {
        return !empty($this->merchantId) &&
               !empty($this->apiKey) &&
               !empty($this->serviceTypeId) &&
               !str_starts_with($this->apiKey, 'mock_') &&
               $this->apiKey !== 'test_key';
    }

    public function initializePayment(array $params): PaymentInitializationResult
    {
        $amount = (float)($params['amount'] ?? 0);
        $reference = (string)($params['reference'] ?? 'HT-REM-' . bin2hex(random_bytes(6)));

        if ($amount < 100) {
            return new PaymentInitializationResult(
                false,
                $reference,
                null,
                null,
                [],
                'Minimum funding amount is ₦100.00'
            );
        }

        if (!$this->isConfigured()) {
            return new PaymentInitializationResult(
                false,
                $reference,
                null,
                null,
                [
                    'configured' => false,
                    'status' => 'BLOCKED',
                    'missing' => [
                        'merchantId'    => empty($this->merchantId),
                        'apiKey'        => empty($this->apiKey),
                        'serviceTypeId' => empty($this->serviceTypeId),
                    ],
                ],
                'BLOCKED — REMITA PRODUCTION CONFIGURATION REQUIRED: Production Remita merchant ID, service type ID, and API key must be configured in environment variables.'
            );
        }

        // Production Remita API integration contract
        $orderId = $reference;
        $hash = hash('sha512', $this->merchantId . $this->serviceTypeId . $orderId . (string)$amount . $this->apiKey);
        $payload = json_encode([
            'serviceTypeId' => $this->serviceTypeId,
            'amount'        => (string)$amount,
            'orderId'       => $orderId,
            'payerName'     => (string)($params['name'] ?? 'HambakTech Customer'),
            'payerEmail'    => (string)($params['email'] ?? 'customer@hambaktech.com.ng'),
            'payerPhone'    => (string)($params['phone'] ?? ''),
            'description'   => 'HambakTech Digital Wallet Funding',
            'apiKey'        => $this->apiKey,
        ]);

        $ch = curl_init($this->baseUrl . '/echannelsvc/merchant/api/paymentinit');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: remitaConsumerKey=' . $this->merchantId . ',remitaConsumerToken=' . $hash,
            ],
            CURLOPT_TIMEOUT => 25,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || !empty($curlError)) {
            return new PaymentInitializationResult(
                false,
                $reference,
                null,
                null,
                [],
                "Remita gateway connection error: {$curlError}"
            );
        }

        $data = json_decode($response, true);
        if ($httpCode >= 200 && $httpCode < 300 && !empty($data['statuscode']) && $data['statuscode'] === '025') {
            $rrr = (string)($data['RRR'] ?? '');
            $authUrl = "https://remita.net/remita/ecomm/finalize.reg?RRR={$rrr}";
            return new PaymentInitializationResult(
                true,
                $reference,
                $authUrl,
                $rrr,
                $data
            );
        }

        $msg = $data['statusmessage'] ?? $data['message'] ?? "Remita initialization failed with code {$httpCode}";
        return new PaymentInitializationResult(false, $reference, null, null, $data ?? [], $msg);
    }

    public function verifyPayment(string $reference): PaymentVerificationResult
    {
        if (!$this->isConfigured()) {
            return new PaymentVerificationResult(
                false,
                'CONFIGURATION_ERROR',
                0.0,
                'NGN',
                null,
                null,
                ['configured' => false, 'status' => 'BLOCKED'],
                'BLOCKED — REMITA PRODUCTION CONFIGURATION REQUIRED: Remita credentials are not configured on this server.'
            );
        }

        $hash = hash('sha512', $reference . $this->apiKey . $this->merchantId);
        $endpoint = $this->baseUrl . "/echannelsvc/{$this->merchantId}/{$reference}/{$hash}/orderstatus.reg";

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 25,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || !empty($curlError)) {
            return new PaymentVerificationResult(
                false,
                'PENDING',
                0.0,
                'NGN',
                null,
                null,
                [],
                "Remita network verification error: {$curlError}"
            );
        }

        $data = json_decode($response, true);
        if ($httpCode === 200 && is_array($data)) {
            $statusCode = (string)($data['status'] ?? $data['statuscode'] ?? '');
            $amount = (float)($data['amount'] ?? 0);
            $resRef = (string)($data['orderId'] ?? $data['reference'] ?? '');

            if ($statusCode === '00' || $statusCode === '01') {
                return new PaymentVerificationResult(
                    true,
                    'SUCCESSFUL',
                    $amount,
                    'NGN',
                    (string)($data['RRR'] ?? $reference),
                    $data['transactiontime'] ?? date('Y-m-d H:i:s'),
                    $data
                );
            }

            $status = match ($statusCode) {
                '021' => 'PENDING',
                default => 'FAILED',
            };

            return new PaymentVerificationResult(
                false,
                $status,
                $amount,
                'NGN',
                (string)($data['RRR'] ?? null),
                null,
                $data,
                $data['message'] ?? "Remita returned status code {$statusCode}"
            );
        }

        return new PaymentVerificationResult(
            false,
            'FAILED',
            0.0,
            'NGN',
            null,
            null,
            $data ?? [],
            $data['message'] ?? "Remita verification failed with HTTP {$httpCode}"
        );
    }

    public function verifyWebhookSignature(string $rawPayload, array $headers): bool
    {
        $signature = $headers['x-remita-signature']
            ?? $headers['X-Remita-Signature']
            ?? $headers['HTTP_X_REMITA_SIGNATURE']
            ?? null;

        if (!$signature || empty($this->apiKey)) {
            return false;
        }

        $computed = hash_hmac('sha512', $rawPayload, $this->apiKey);
        return hash_equals($computed, (string)$signature);
    }

    public function parseWebhookPayload(string $rawPayload): NormalizedWebhookEvent
    {
        $data = json_decode($rawPayload, true);
        if (!is_array($data)) {
            throw new RuntimeException("Invalid Remita webhook JSON payload");
        }

        $event = (string)($data['event'] ?? 'payment.settled');
        $tx = $data['data'] ?? $data;
        $ref = (string)($tx['orderId'] ?? $tx['reference'] ?? '');
        $amount = (float)($tx['amount'] ?? 0.0);
        $statusStr = (string)($tx['status'] ?? $tx['statuscode'] ?? '');
        $status = ($statusStr === '00' || $statusStr === '01' || strtoupper($statusStr) === 'SUCCESSFUL')
            ? 'SUCCESSFUL'
            : 'PENDING';

        return new NormalizedWebhookEvent(
            isset($tx['RRR']) ? (string)$tx['RRR'] : null,
            $event,
            $ref,
            $amount,
            $status,
            $tx['transactiontime'] ?? null,
            $tx['metadata'] ?? [],
            $rawPayload
        );
    }
}
