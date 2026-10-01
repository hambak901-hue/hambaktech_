<?php
declare(strict_types=1);
namespace HambakTech\Services\Telecom;
interface TelecomProviderInterface
{
    public function code(): string;
    public function configured(): bool;
    public function variations(string $type,array $input=[]): array;
    public function verifyCustomer(array $input): array;
    public function purchase(string $type,array $input,string $requestId): array;
    public function requery(string $requestId): array;
}
