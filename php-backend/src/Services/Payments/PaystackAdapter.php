<?php
declare(strict_types=1);

namespace HambakTech\Services\Payments;

use HambakTech\Config\Env;
use RuntimeException;

class PaystackAdapter implements PaymentProviderInterface
{
    private string $secretKey;
    private string $publicKey;
    private string $baseUrl = 'https://api.paystack.co';

    public function __construct(?string $secretKey = null, ?string $publicKey = null)
    {
        $this->secretKey = $secretKey ?? (string)Env::get('PAYSTACK_SECRET_KEY', '');
        $this->publicKey = $publicKey ?? (string)Env::get('PAYSTACK_PUBLIC_KEY', '');
    }

    public function getIdentifier(): string
    {
        return 'PAYSTACK';
    }

    public function initializePayment(array $params): PaymentInitializationResult
    {
        $amount = (float)($params['amount'] ?? 0);
        $email = (string)($params['email'] ?? 'customer@hambaktech.com.ng');
        $reference = (string)($params['reference'] ?? 'HT-PAY-' . bin2hex(random_bytes(8)));
        $callbackUrl = (string)($params['callbackUrl'] ?? (Env::get('APP_URL', 'https://hambaktech.com.ng') . '/dashboard/wallet/verify'));

        if ($amount < 100) {
            return new PaymentInitializationResult(false, $reference, null, null, [], 'Minimum funding amount is ₦100.00');
        }

        // Amount in Kobo for Paystack
        $amountKobo = (int)round($amount * 100);

        if (empty($this->secretKey) || str_starts_with($this->secretKey, 'mock_') || $this->secretKey === 'test_key') {
            return new PaymentInitializationResult(
                false,
                $reference,
                null,
                null,
                ['configured' => false],
                'Paystack gateway credentials are not configured on this server. Please configure PAYSTACK_SECRET_KEY in production.'
            );
        }

        // Real API Call
        $payload = json_encode([
            'email' => $email,
            'amount' => $amountKobo,
            'reference' => $reference,
            'callback_url' => $callbackUrl,
            'metadata' => $params['metadata'] ?? [],
        ]);

        $ch = curl_init($this->baseUrl . '/transaction/initialize');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->secretKey,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 20,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || !empty($curlError)) {
            return new PaymentInitializationResult(false, $reference, null, null, [], "Paystack connection error: {$curlError}");
        }

        $data = json_decode($response, true);
        if ($httpCode >= 200 && $httpCode < 300 && !empty($data['status']) && !empty($data['data']['authorization_url'])) {
            return new PaymentInitializationResult(
                true,
                $reference,
                $data['data']['authorization_url'],
                $data['data']['access_code'] ?? null,
                $data['data']
            );
        }

        $msg = $data['message'] ?? "Paystack initialization failed with HTTP {$httpCode}";
        return new PaymentInitializationResult(false, $reference, null, null, $data ?? [], $msg);
    }

    public function verifyPayment(string $reference): PaymentVerificationResult
    {
        if (empty($this->secretKey) || str_starts_with($this->secretKey, 'mock_') || $this->secretKey === 'test_key') {
            // Missing or mock credentials must result in CONFIGURATION_ERROR; never simulate successful settlement
            return new PaymentVerificationResult(
                false,
                'CONFIGURATION_ERROR',
                0.0,
                'NGN',
                null,
                null,
                ['configured' => false],
                'Paystack gateway credentials are not configured. Cannot perform live payment verification.'
            );
        }

        $ch = curl_init($this->baseUrl . '/transaction/verify/' . rawurlencode($reference));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->secretKey,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 20,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || !empty($curlError)) {
            return new PaymentVerificationResult(false, 'PENDING', 0.0, 'NGN', null, null, [], "Network error: {$curlError}");
        }

        $data = json_decode($response, true);
        if ($httpCode === 200 && !empty($data['status']) && isset($data['data'])) {
            $txData = $data['data'];
            $statusStr = strtoupper((string)($txData['status'] ?? ''));
            $status = match ($statusStr) {
                'SUCCESS' => 'SUCCESSFUL',
                'FAILED' => 'FAILED',
                'ABANDONED' => 'ABANDONED',
                default => 'PENDING',
            };

            $amount = isset($txData['amount']) ? ((float)$txData['amount'] / 100.0) : 0.0;
            $resRef = (string)($txData['reference'] ?? '');
            $currency = (string)($txData['currency'] ?? 'NGN');
            $isSuccessful = ($status === 'SUCCESSFUL') && ($resRef === $reference) && ($amount > 0);

            return new PaymentVerificationResult(
                $isSuccessful,
                $status,
                $amount,
                $currency,
                (string)($txData['id'] ?? $txData['reference'] ?? ''),
                $txData['paid_at'] ?? $txData['paidAt'] ?? null,
                $data
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
            $data['message'] ?? "Verification failed with HTTP {$httpCode}"
        );
    }

    public function verifyWebhookSignature(string $rawPayload, array $headers): bool
    {
        $signature = $headers['x-paystack-signature']
            ?? $headers['X-Paystack-Signature']
            ?? $headers['HTTP_X_PAYSTACK_SIGNATURE']
            ?? null;

        if (!$signature || empty($this->secretKey)) {
            return false;
        }

        $computed = hash_hmac('sha512', $rawPayload, $this->secretKey);
        return hash_equals($computed, (string)$signature);
    }

    public function parseWebhookPayload(string $rawPayload): NormalizedWebhookEvent
    {
        $data = json_decode($rawPayload, true);
        if (!is_array($data)) {
            throw new RuntimeException("Invalid webhook JSON payload");
        }

        $event = (string)($data['event'] ?? 'unknown');
        $tx = $data['data'] ?? [];
        $ref = (string)($tx['reference'] ?? '');
        $amount = isset($tx['amount']) ? ((float)$tx['amount'] / 100.0) : 0.0;
        $statusStr = strtoupper((string)($tx['status'] ?? ''));
        $status = match ($statusStr) {
            'SUCCESS' => 'SUCCESSFUL',
            'FAILED' => 'FAILED',
            default => 'PENDING',
        };

        return new NormalizedWebhookEvent(
            isset($tx['id']) ? (string)$tx['id'] : null,
            $event,
            $ref,
            $amount,
            $status,
            $tx['paid_at'] ?? null,
            $tx['metadata'] ?? [],
            $rawPayload
        );
    }
}
