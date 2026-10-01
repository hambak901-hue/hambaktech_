<?php
declare(strict_types=1);

namespace HambakTech\Services\Payments;

use HambakTech\Config\Env;

class BankTransferAdapter implements PaymentProviderInterface
{
    public function getIdentifier(): string
    {
        return 'BANK_TRANSFER';
    }

    public function initializePayment(array $params): PaymentInitializationResult
    {
        $amount = (float)($params['amount'] ?? 0);
        $reference = (string)($params['reference'] ?? 'HT-BANK-' . bin2hex(random_bytes(6)));

        if ($amount < 100) {
            return new PaymentInitializationResult(false, $reference, null, null, [], 'Minimum funding amount is ₦100.00');
        }

        $bankName = (string)Env::get('CORPORATE_BANK_NAME', '');
        $accountNumber = (string)Env::get('CORPORATE_BANK_ACCOUNT', '');
        $accountName = (string)Env::get('CORPORATE_BANK_ACCOUNT_NAME', '');

        if (empty($accountNumber)) {
            return new PaymentInitializationResult(
                false,
                $reference,
                null,
                null,
                [],
                'Corporate bank transfer is currently not configured. Please choose an automated gateway (Paystack/Flutterwave).'
            );
        }

        $bankDetails = [
            'bankName' => $bankName,
            'accountNumber' => $accountNumber,
            'accountName' => $accountName,
            'reference' => $reference,
            'instructions' => 'Please use this transaction reference (' . $reference . ') as the payment narration or remark during transfer.',
        ];

        return new PaymentInitializationResult(
            true,
            $reference,
            null,
            $reference,
            ['bankDetails' => $bankDetails, 'amount' => $amount, 'currency' => 'NGN']
        );
    }

    public function verifyPayment(string $reference): PaymentVerificationResult
    {
        return new PaymentVerificationResult(
            false,
            'PENDING',
            0.0,
            'NGN',
            $reference,
            null,
            [],
            'Bank transfer awaits manual administrator confirmation or bank webhook settlement.'
        );
    }

    public function verifyWebhookSignature(string $rawPayload, array $headers): bool
    {
        return false;
    }

    public function parseWebhookPayload(string $rawPayload): NormalizedWebhookEvent
    {
        return new NormalizedWebhookEvent(null, 'manual_transfer', '', 0.0, 'PENDING');
    }
}
