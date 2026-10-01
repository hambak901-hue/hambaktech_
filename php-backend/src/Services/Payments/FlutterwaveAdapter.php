<?php
declare(strict_types=1);

namespace HambakTech\Services\Payments;

use HambakTech\Config\Env;
use RuntimeException;

class FlutterwaveAdapter implements PaymentProviderInterface
{
    private string $secretKey;
    private string $secretHash;
    private string $baseUrl = 'https://api.flutterwave.com/v3';

    public function __construct(?string $secretKey = null, ?string $secretHash = null)
    {
        $this->secretKey = $secretKey ?? (string)Env::get('FLUTTERWAVE_SECRET_KEY', '');
        $this->secretHash = $secretHash ?? (string)Env::get('FLUTTERWAVE_SECRET_HASH', '');
    }

    public function getIdentifier(): string
    {
        return 'FLUTTERWAVE';
    }

    public function initializePayment(array $params): PaymentInitializationResult
    {
        $amount = (float)($params['amount'] ?? 0);
        $email = (string)($params['email'] ?? 'customer@hambaktech.com.ng');
        $reference = (string)($params['reference'] ?? 'HT-PAY-' . bin2hex(random_bytes(8)));
        $redirectUrl = (string)($params['callbackUrl'] ?? (Env::get('APP_URL', 'https://hambaktech.com.ng') . '/dashboard/wallet/verify'));

        if ($amount < 100) {
            return new PaymentInitializationResult(false, $reference, null, null, [], 'Minimum funding amount is ₦100.00');
        }

        if (empty($this->secretKey) || str_starts_with($this->secretKey, 'mock_') || $this->secretKey === 'test_key') {
            return new PaymentInitializationResult(
                false,
                $reference,
                null,
                null,
                ['configured' => false],
                'Flutterwave gateway credentials are not configured on this server. Please configure FLUTTERWAVE_SECRET_KEY in production.'
            );
        }

        $payload = json_encode([
            'tx_ref' => $reference,
            'amount' => $amount,
            'currency' => 'NGN',
            'redirect_url' => $redirectUrl,
            'customer' => [
                'email' => $email,
                'name' => $params['name'] ?? 'HambakTech Customer',
            ],
            'customizations' => [
                'title' => 'HambakTech Wallet Funding',
                'logo' => 'https://hambaktech.com.ng/logo.png',
            ],
            'meta' => $params['metadata'] ?? [],
        ]);

        $ch = curl_init($this->baseUrl . '/payments');
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
            return new PaymentInitializationResult(false, $reference, null, null, [], "Flutterwave connection error: {$curlError}");
        }

        $data = json_decode($response, true);
        if ($httpCode >= 200 && $httpCode < 300 && !empty($data['status']) && $data['status'] === 'success' && !empty($data['data']['link'])) {
            return new PaymentInitializationResult(
                true,
                $reference,
                $data['data']['link'],
                $reference,
                $data['data']
            );
        }

        $msg = $data['message'] ?? "Flutterwave initialization failed with HTTP {$httpCode}";
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
                'Flutterwave gateway credentials are not configured. Cannot perform live payment verification.'
            );
        }

        $ch = curl_init($this->baseUrl . '/transactions/verify_by_reference?tx_ref=' . rawurlencode($reference));
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
        if ($httpCode === 200 && !empty($data['status']) && $data['status'] === 'success' && isset($data['data'])) {
            $txData = $data['data'];
            $statusStr = strtoupper((string)($txData['status'] ?? ''));
            $status = match ($statusStr) {
                'SUCCESSFUL' => 'SUCCESSFUL',
                'FAILED' => 'FAILED',
                default => 'PENDING',
            };

            $amount = (float)($txData['amount'] ?? 0);
            $resRef = (string)($txData['tx_ref'] ?? '');
            $currency = (string)($txData['currency'] ?? 'NGN');
            $isSuccessful = ($status === 'SUCCESSFUL') && ($resRef === $reference) && ($amount > 0);

            return new PaymentVerificationResult(
                $isSuccessful,
                $status,
                $amount,
                $currency,
                (string)($txData['id'] ?? $txData['flw_ref'] ?? ''),
                $txData['created_at'] ?? null,
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
        $hash = $headers['verif-hash']
            ?? $headers['Verif-Hash']
            ?? $headers['HTTP_VERIF_HASH']
            ?? null;

        if (!$hash || empty($this->secretHash)) {
            return false;
        }

        return hash_equals($this->secretHash, (string)$hash);
    }

    public function parseWebhookPayload(string $rawPayload): NormalizedWebhookEvent
    {
        $data = json_decode($rawPayload, true);
        if (!is_array($data)) {
            throw new RuntimeException("Invalid webhook JSON payload");
        }

        $event = (string)($data['event'] ?? 'charge.completed');
        $tx = $data['data'] ?? $data;
        $ref = (string)($tx['tx_ref'] ?? $tx['txRef'] ?? '');
        $amount = (float)($tx['amount'] ?? 0.0);
        $statusStr = strtoupper((string)($tx['status'] ?? ''));
        $status = match ($statusStr) {
            'SUCCESSFUL', 'SUCCESS' => 'SUCCESSFUL',
            'FAILED' => 'FAILED',
            default => 'PENDING',
        };

        return new NormalizedWebhookEvent(
            isset($tx['id']) ? (string)$tx['id'] : null,
            $event,
            $ref,
            $amount,
            $status,
            $tx['created_at'] ?? null,
            $tx['customer'] ?? [],
            $rawPayload
        );
    }
}
