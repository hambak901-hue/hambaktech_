<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Services\WalletService;
use HambakTech\Utils\Response;
use Throwable;

class PaymentsController extends BaseController
{
    private WalletService $walletService;

    public function __construct(?WalletService $walletService = null)
    {
        parent::__construct();
        $this->walletService = $walletService ?? new WalletService();
    }

    /**
     * Public or authenticated payment initialization
     */
    public function initialize(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();

        $amount = (float)($body['amount'] ?? 0);
        $channel = (string)($body['channel'] ?? $body['provider'] ?? 'PAYSTACK');
        $metadata = (array)($body['metadata'] ?? []);

        try {
            $result = $this->walletService->initializeFunding($user['id'], $amount, $channel, $metadata);
            Response::success($result, 'Payment session initialized.');
        } catch (Throwable $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            Response::error($e->getMessage(), (int)$code);
        }
    }

    /**
     * Authoritative payment verification
     */
    public function verify(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();
        $reference = (string)($body['reference'] ?? $_GET['reference'] ?? '');

        if (empty($reference)) {
            Response::error('Payment reference is required.', 400);
            return;
        }

        try {
            $result = $this->walletService->verifyFunding($user['id'], $reference);
            Response::success($result, 'Payment verification evaluated.');
        } catch (Throwable $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            Response::error($e->getMessage(), (int)$code);
        }
    }

    /**
     * Inbound cryptographic webhook handler
     * Endpoint: /api/payments/webhook/{provider}
     */
    public function handleWebhook(array $params = []): void
    {
        $provider = strtolower((string)($params['provider'] ?? $params['gateway'] ?? 'paystack'));
        $rawPayload = file_get_contents('php://input');

        if ($rawPayload === false || $rawPayload === '') {
            Response::error('Empty webhook payload received.', 400);
            return;
        }

        $headers = function_exists('getallheaders') ? getallheaders() : [];
        if (empty($headers)) {
            foreach ($_SERVER as $key => $val) {
                if (str_starts_with($key, 'HTTP_')) {
                    $name = str_replace('_', '-', strtolower(substr($key, 5)));
                    $headers[$name] = $val;
                }
            }
        }

        try {
            $result = $this->walletService->processWebhook($provider, $rawPayload, $headers);
            Response::success($result, 'Webhook processed.');
        } catch (Throwable $e) {
            $code = $e->getCode() === 401 ? 401 : 400;
            Response::error($e->getMessage(), $code);
        }
    }
}
