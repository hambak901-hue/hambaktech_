<?php
declare(strict_types=1);

namespace HambakTech\Services\Payments;

/**
 * Normalized Result of Payment Initialization
 */
class PaymentInitializationResult
{
    public bool $success;
    public string $reference;
    public ?string $authorizationUrl;
    public ?string $providerReference;
    public array $metadata;
    public ?string $errorMessage;

    public function __construct(
        bool $success,
        string $reference,
        ?string $authorizationUrl = null,
        ?string $providerReference = null,
        array $metadata = [],
        ?string $errorMessage = null
    ) {
        $this->success = $success;
        $this->reference = $reference;
        $this->authorizationUrl = $authorizationUrl;
        $this->providerReference = $providerReference;
        $this->metadata = $metadata;
        $this->errorMessage = $errorMessage;
    }
}

/**
 * Normalized Result of Payment Verification
 */
class PaymentVerificationResult
{
    public bool $success;
    public string $status; // 'SUCCESSFUL', 'FAILED', 'PENDING', 'ABANDONED'
    public float $amount;
    public string $currency;
    public ?string $providerReference;
    public ?string $paidAt;
    public array $rawResponse;
    public ?string $errorMessage;

    public function __construct(
        bool $success,
        string $status,
        float $amount = 0.0,
        string $currency = 'NGN',
        ?string $providerReference = null,
        ?string $paidAt = null,
        array $rawResponse = [],
        ?string $errorMessage = null
    ) {
        $this->success = $success;
        $this->status = $status;
        $this->amount = $amount;
        $this->currency = $currency;
        $this->providerReference = $providerReference;
        $this->paidAt = $paidAt;
        $this->rawResponse = $rawResponse;
        $this->errorMessage = $errorMessage;
    }
}

/**
 * Normalized Inbound Webhook Event
 */
class NormalizedWebhookEvent
{
    public ?string $eventId;
    public string $eventType;
    public string $reference;
    public float $amount;
    public string $status;
    public ?string $paidAt;
    public array $metadata;
    public string $rawPayload;

    public function __construct(
        ?string $eventId,
        string $eventType,
        string $reference,
        float $amount,
        string $status,
        ?string $paidAt = null,
        array $metadata = [],
        string $rawPayload = ''
    ) {
        $this->eventId = $eventId;
        $this->eventType = $eventType;
        $this->reference = $reference;
        $this->amount = $amount;
        $this->status = $status;
        $this->paidAt = $paidAt;
        $this->metadata = $metadata;
        $this->rawPayload = $rawPayload;
    }
}

/**
 * Payment Provider Abstraction Interface
 * Decouples core wallet & financial services from external payment gateways.
 */
interface PaymentProviderInterface
{
    /**
     * Unique identifier slug of the provider (e.g. 'PAYSTACK', 'FLUTTERWAVE', 'MONIEPOINT', 'BANK_TRANSFER')
     */
    public function getIdentifier(): string;

    /**
     * Initialize a payment session.
     *
     * @param array $params Contains: amount, email, reference, callbackUrl, metadata
     */
    public function initializePayment(array $params): PaymentInitializationResult;

    /**
     * Authoritatively verify payment settlement status with the provider API.
     */
    public function verifyPayment(string $reference): PaymentVerificationResult;

    /**
     * Cryptographically verify inbound webhook signature.
     */
    public function verifyWebhookSignature(string $rawPayload, array $headers): bool;

    /**
     * Parse inbound webhook payload into normalized event data.
     */
    public function parseWebhookPayload(string $rawPayload): NormalizedWebhookEvent;
}
