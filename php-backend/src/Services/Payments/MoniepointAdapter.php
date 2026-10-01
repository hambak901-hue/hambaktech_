<?php
declare(strict_types=1);

namespace HambakTech\Services\Payments;

use HambakTech\Config\Env;
use RuntimeException;

class MoniepointAdapter implements PaymentProviderInterface
{
    private string $apiKey;
    private string $secretKey;

    public function __construct(?string $apiKey = null, ?string $secretKey = null)
    {
        $this->apiKey = $apiKey ?? (string)Env::get('MONIEPOINT_API_KEY', '');
        $this->secretKey = $secretKey ?? (string)Env::get('MONIEPOINT_SECRET_KEY', '');
    }

    public function getIdentifier(): string
    {
        return 'MONIEPOINT';
    }

    public function initializePayment(array $params): PaymentInitializationResult
    {
        $amount = (float)($params['amount'] ?? 0);
        $reference = (string)($params['reference'] ?? 'HT-PAY-' . bin2hex(random_bytes(8)));

        if ($amount < 100) {
            return new PaymentInitializationResult(false, $reference, null, null, [], 'Minimum funding amount is ₦100.00');
        }

        // Moniepoint Manual Payment Workflow
        $bankName = (string)Env::get('MONIEPOINT_BANK_NAME', 'Moniepoint MFB');
        $accountNumber = (string)Env::get('MONIEPOINT_ACCOUNT_NUMBER', Env::get('CORPORATE_BANK_ACCOUNT', ''));
        $accountName = (string)Env::get('MONIEPOINT_ACCOUNT_NAME', Env::get('CORPORATE_BANK_ACCOUNT_NAME', ''));

        if (empty($accountNumber)) {
            return new PaymentInitializationResult(
                false,
                $reference,
                null,
                null,
                [],
                'Moniepoint payment channel is currently not configured on this server.'
            );
        }

        $bankDetails = [
            'bankName'      => $bankName,
            'accountNumber' => $accountNumber,
            'accountName'   => $accountName,
            'reference'     => $reference,
            'instructions'  => 'Transfer exact amount to the Moniepoint account above and use reference (' . $reference . ') as the payment remark or narration. Payment will be verified upon receipt.',
        ];

        return new PaymentInitializationResult(
            true,
            $reference,
            null, // Manual transfer: no external automated redirect URL
            $reference,
            ['bankDetails' => $bankDetails, 'amount' => $amount, 'currency' => 'NGN']
        );
    }

    public function verifyPayment(string $reference): PaymentVerificationResult
    {
        // Moniepoint manual workflow: remains PENDING until verified by administrator or webhook
        return new PaymentVerificationResult(
            false,
            'PENDING',
            0.0,
            'NGN',
            $reference,
            null,
            ['mode' => 'manual_moniepoint_workflow'],
            'Moniepoint transfer payment is awaiting administrative verification or settlement confirmation.'
        );
    }

    public function verifyWebhookSignature(string $rawPayload, array $headers): bool
    {
        $signature = $headers['x-moniepoint-signature']
            ?? $headers['X-Moniepoint-Signature']
            ?? $headers['HTTP_X_MONIEPOINT_SIGNATURE']
            ?? null;

        if (!$signature || empty($this->secretKey)) {
            return false;
        }

        $computed = hash_hmac('sha256', $rawPayload, $this->secretKey);
        return hash_equals($computed, (string)$signature);
    }

    public function parseWebhookPayload(string $rawPayload): NormalizedWebhookEvent
    {
        $data = json_decode($rawPayload, true);
        if (!is_array($data)) {
            throw new RuntimeException("Invalid webhook JSON payload");
        }

        $event = (string)($data['event'] ?? 'transaction.successful');
        $tx = $data['data'] ?? $data;
        $ref = (string)($tx['paymentReference'] ?? $tx['reference'] ?? '');
        $amount = (float)($tx['amount'] ?? 0.0);

        return new NormalizedWebhookEvent(
            isset($tx['transactionId']) ? (string)$tx['transactionId'] : null,
            $event,
            $ref,
            $amount,
            'SUCCESSFUL',
            $tx['paidAt'] ?? date('Y-m-d H:i:s'),
            $tx,
            $rawPayload
        );
    }
}
