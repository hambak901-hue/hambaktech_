<?php
declare(strict_types=1);

namespace HambakTech\Controllers;

use HambakTech\Services\WalletService;
use HambakTech\Utils\Response;
use Throwable;

class WalletController extends BaseController
{
    private WalletService $walletService;

    public function __construct(?WalletService $walletService = null)
    {
        parent::__construct();
        $this->walletService = $walletService ?? new WalletService();
    }

    public function getWallet(): void
    {
        $user = $this->getAuthUser();
        $wallet = $this->walletService->getWallet($user['id']);
        Response::success($wallet, 'Wallet balance retrieved.');
    }

    public function getTransactions(): void
    {
        $user = $this->getAuthUser();
        $filters = [
            'limit'  => isset($_GET['limit']) ? (int)$_GET['limit'] : 20,
            'offset' => isset($_GET['offset']) ? (int)$_GET['offset'] : 0,
            'type'   => $_GET['type'] ?? null,
            'status' => $_GET['status'] ?? null,
        ];
        $result = $this->walletService->getTransactions($user['id'], $filters);
        Response::success($result, 'Wallet transactions retrieved.');
    }

    public function getLedger(): void
    {
        $user = $this->getAuthUser();
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $ledger = $this->walletService->getLedger($user['id'], $limit, $offset);
        Response::success($ledger, 'Wallet ledger history retrieved.');
    }

    public function initializeFunding(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();

        $amount = (float)($body['amount'] ?? 0);
        $channel = (string)($body['channel'] ?? $body['provider'] ?? 'PAYSTACK');
        $metadata = (array)($body['metadata'] ?? []);

        try {
            $result = $this->walletService->initializeFunding($user['id'], $amount, $channel, $metadata);
            Response::success($result, 'Wallet funding initialized.');
        } catch (Throwable $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            Response::error($e->getMessage(), (int)$code);
        }
    }

    public function verifyFunding(): void
    {
        $user = $this->getAuthUser();
        $body = $this->getJsonBody();
        $reference = (string)($body['reference'] ?? $_GET['reference'] ?? '');

        if (empty($reference)) {
            Response::error('Reference parameter is required.', 400);
            return;
        }

        try {
            $result = $this->walletService->verifyFunding($user['id'], $reference);
            Response::success($result, 'Wallet funding verification evaluated.');
        } catch (Throwable $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            Response::error($e->getMessage(), (int)$code);
        }
    }

    /**
     * Backward-compatible fund endpoint. If raw amount is given without verification,
     * routes through two-phase initialization to prevent arbitrary balance minting.
     */
    public function fund(): void
    {
        $body = $this->getJsonBody();
        if (!empty($body['verify']) || !empty($body['reference'])) {
            $this->verifyFunding();
            return;
        }

        $this->initializeFunding();
    }

    public function reconcile(): void
    {
        $user = $this->getAuthUser();
        $result = $this->walletService->reconcileWallet($user['id']);
        Response::success($result, 'Wallet balance reconciliation audit.');
    }
}
