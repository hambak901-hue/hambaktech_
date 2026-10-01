<?php
declare(strict_types=1);

namespace HambakTech\Services\Payments;

use HambakTech\Config\Env;
use InvalidArgumentException;

class PaymentProviderRegistry
{
    private array $providers = [];

    public function __construct()
    {
        $this->register(new PaystackAdapter());
        $this->register(new FlutterwaveAdapter());
        $this->register(new RemitaAdapter());
        $this->register(new MoniepointAdapter());
        $this->register(new BankTransferAdapter());
    }

    public function register(PaymentProviderInterface $provider): void
    {
        $this->providers[strtoupper($provider->getIdentifier())] = $provider;
    }

    public function getProvider(?string $identifier = null): PaymentProviderInterface
    {
        if (empty($identifier)) {
            $identifier = (string)Env::get('DEFAULT_PAYMENT_PROVIDER', 'PAYSTACK');
        }

        $key = strtoupper(trim($identifier));
        if (!isset($this->providers[$key])) {
            throw new InvalidArgumentException("Unsupported payment provider: {$identifier}");
        }

        return $this->providers[$key];
    }

    public function getAvailableProviders(): array
    {
        return array_keys($this->providers);
    }
}
