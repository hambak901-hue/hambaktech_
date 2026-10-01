/**
 * High-precision fixed-point monetary calculation engine for TypeScript.
 * Eliminates IEEE 754 floating-point drift across all authoritative financial operations.
 * Precision: 2 decimal places (Kobo / Cents) internally calculated via integer math.
 */

export class Money {
  private static readonly SCALE = 2;

  /**
   * Converts a monetary amount to integer Kobo (smallest currency unit).
   */
  public static toKobo(amount: number | string): number {
    const num = typeof amount === "string" ? parseFloat(amount.trim()) : amount;
    if (isNaN(num)) {
      throw new Error(`Invalid monetary amount: ${amount}`);
    }
    return Math.round(num * 100);
  }

  /**
   * Converts integer Kobo back to standard decimal number rounded to 2 decimals.
   */
  public static fromKobo(kobo: number): number {
    return Math.round(kobo) / 100;
  }

  /**
   * Adds two monetary amounts with fixed 2-decimal precision.
   */
  public static add(a: number | string, b: number | string): number {
    return this.fromKobo(this.toKobo(a) + this.toKobo(b));
  }

  /**
   * Subtracts amount b from a with fixed 2-decimal precision.
   */
  public static subtract(a: number | string, b: number | string): number {
    return this.fromKobo(this.toKobo(a) - this.toKobo(b));
  }

  /**
   * Compares two monetary amounts.
   * Returns -1 if a < b, 0 if a == b, 1 if a > b.
   */
  public static compare(a: number | string, b: number | string): number {
    const koboA = this.toKobo(a);
    const koboB = this.toKobo(b);
    if (koboA < koboB) return -1;
    if (koboA > koboB) return 1;
    return 0;
  }

  /**
   * Verifies if two monetary amounts are strictly equal.
   */
  public static equals(a: number | string, b: number | string): number | boolean {
    return this.toKobo(a) === this.toKobo(b);
  }

  /**
   * Verifies if a monetary amount is positive (> 0.00).
   */
  public static isPositive(amount: number | string): boolean {
    return this.toKobo(amount) > 0;
  }

  /**
   * Formats an amount with standard comma separation (e.g., ₦25,000.00).
   */
  public static format(amount: number | string, currency: string = "NGN"): string {
    const kobo = this.toKobo(amount);
    const val = (kobo / 100).toLocaleString("en-NG", {
      minimumFractionDigits: this.SCALE,
      maximumFractionDigits: this.SCALE,
    });
    return currency === "NGN" ? `₦${val}` : `${currency} ${val}`;
  }
}
