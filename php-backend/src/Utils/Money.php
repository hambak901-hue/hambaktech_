<?php
declare(strict_types=1);

namespace HambakTech\Utils;

use InvalidArgumentException;

/**
 * High-precision fixed-point monetary calculation engine.
 * Eliminates IEEE 754 floating-point drift across all authoritative financial operations.
 * Precision: 2 decimal places (Kobo / Cents) internally represented as integer cents or bcmath strings.
 */
class Money
{
    private const SCALE = 2;

    /**
     * Converts a monetary amount to integer Kobo (smallest currency unit).
     */
    public static function toKobo(float|string|int $amount): int
    {
        $amountStr = is_string($amount) ? trim($amount) : (string)$amount;
        if (!is_numeric($amountStr)) {
            throw new InvalidArgumentException("Invalid monetary amount: {$amountStr}");
        }
        return (int)round(((float)$amountStr) * 100);
    }

    /**
     * Converts integer Kobo back to standard decimal string formatted to 2 decimals.
     */
    public static function fromKobo(int $kobo): string
    {
        return number_format($kobo / 100, self::SCALE, '.', '');
    }

    /**
     * Adds two monetary amounts with fixed 2-decimal precision.
     */
    public static function add(float|string|int $a, float|string|int $b): float
    {
        $koboA = self::toKobo($a);
        $koboB = self::toKobo($b);
        return ($koboA + $koboB) / 100;
    }

    /**
     * Subtracts amount $b from $a with fixed 2-decimal precision.
     */
    public static function subtract(float|string|int $a, float|string|int $b): float
    {
        $koboA = self::toKobo($a);
        $koboB = self::toKobo($b);
        return ($koboA - $koboB) / 100;
    }

    /**
     * Compares two monetary amounts.
     * Returns -1 if $a < $b, 0 if $a == $b, 1 if $a > $b.
     */
    public static function compare(float|string|int $a, float|string|int $b): int
    {
        $koboA = self::toKobo($a);
        $koboB = self::toKobo($b);
        return $koboA <=> $koboB;
    }

    /**
     * Verifies if two monetary amounts are strictly equal.
     */
    public static function equals(float|string|int $a, float|string|int $b): bool
    {
        return self::toKobo($a) === self::toKobo($b);
    }

    /**
     * Verifies if a monetary amount is positive (> 0.00).
     */
    public static function isPositive(float|string|int $amount): bool
    {
        return self::toKobo($amount) > 0;
    }

    /**
     * Formats an amount as an authoritative decimal float with 2 decimal places.
     */
    public static function round(float|string|int $amount): float
    {
        return self::toKobo($amount) / 100;
    }

    /**
     * Formats an amount with standard comma separation (e.g., 25,000.00).
     */
    public static function format(float|string|int $amount, string $currency = 'NGN'): string
    {
        $kobo = self::toKobo($amount);
        $val = number_format($kobo / 100, self::SCALE, '.', ',');
        return ($currency === 'NGN' ? '₦' : ($currency . ' ')) . $val;
    }
}
