/**
 * Value Object: Email
 * Represents a validated email address
 */
export class Email {
  private constructor(private readonly _value: string) {}

  public get value(): string {
    return this._value;
  }

  /**
   * Create Email from string with validation
   */
  public static create(email: string): Email {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      throw new Error('Email cannot be empty');
    }

    if (!this.isValidFormat(trimmed)) {
      throw new Error('Invalid email format');
    }

    if (trimmed.length > 254) {
      throw new Error('Email is too long');
    }

    return new Email(trimmed);
  }

  /**
   * Create Email from string without validation (for existing data)
   */
  public static fromString(email: string): Email {
    return new Email(email.trim().toLowerCase());
  }

  /**
   * Validate email format using regex
   */
  private static isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get domain part of email
   */
  public getDomain(): string {
    return this._value.split('@')[1];
  }

  /**
   * Get local part of email (before @)
   */
  public getLocalPart(): string {
    return this._value.split('@')[0];
  }

  /**
   * Check if email is from a specific domain
   */
  public isFromDomain(domain: string): boolean {
    return this.getDomain() === domain.toLowerCase();
  }

  /**
   * Check if email is from VMU domain
   */
  public isVmuEmail(): boolean {
    return this.isFromDomain('vmu.edu.vn') ||
           this.isFromDomain('vanlanguni.edu.vn') ||
           this.isFromDomain('vlu.edu.vn');
  }

  /**
   * Get masked email for privacy
   */
  public getMaskedEmail(): string {
    const [local, domain] = this._value.split('@');
    const maskedLocal = local.length > 2
      ? local.substring(0, 2) + '*'.repeat(local.length - 2)
      : local + '*';
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Convert to string
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Check equality
   */
  public equals(other: Email): boolean {
    return this._value === other._value;
  }

  /**
   * Get hash code for use in collections
   */
  public getHashCode(): string {
    return this._value;
  }
}