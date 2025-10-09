/**
 * Value Object: Password
 * Represents a validated password with security requirements
 */
export class Password {
  private constructor(private readonly _hashedValue: string) {}

  public get hashedValue(): string {
    return this._hashedValue;
  }

  /**
   * Create Password from plain text with validation
   */
  public static create(plainPassword: string): Password {
    if (!plainPassword) {
      throw new Error('Password cannot be empty');
    }

    if (plainPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (plainPassword.length > 128) {
      throw new Error('Password cannot be longer than 128 characters');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(plainPassword)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(plainPassword)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    // Check for at least one digit
    if (!/\d/.test(plainPassword)) {
      throw new Error('Password must contain at least one number');
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(plainPassword)) {
      throw new Error('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein'];
    if (weakPasswords.includes(plainPassword.toLowerCase())) {
      throw new Error('Password is too common and easily guessable');
    }

    // Hash the password (in real implementation, use proper hashing)
    const hashed = Password.hashPassword(plainPassword);

    return new Password(hashed);
  }

  /**
   * Create Password from existing hash (for loading from database)
   */
  public static fromHash(hashedPassword: string): Password {
    if (!hashedPassword) {
      throw new Error('Hashed password cannot be empty');
    }

    return new Password(hashedPassword);
  }

  /**
   * Verify plain password against this password
   */
  public verify(plainPassword: string): boolean {
    const hashedInput = Password.hashPassword(plainPassword);
    return this._hashedValue === hashedInput;
  }

  /**
   * Check if password needs rehashing (for migration purposes)
   */
  public needsRehash(): boolean {
    // In a real implementation, check if hash uses old algorithm
    return false;
  }

  /**
   * Get password strength score (0-100)
   */
  public static getStrengthScore(password: string): number {
    let score = 0;

    // Length scoring
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 10;

    // Character variety scoring
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

    // Complexity bonus
    if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Get password strength level
   */
  public static getStrengthLevel(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
    const score = Password.getStrengthScore(password);

    if (score < 40) return 'weak';
    if (score < 60) return 'medium';
    if (score < 80) return 'strong';
    return 'very-strong';
  }

  /**
   * Generate a secure random password
   */
  public static generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Simple password hashing (in production, use bcrypt, argon2, etc.)
   */
  private static hashPassword(password: string): string {
    // This is a placeholder - in production, use proper password hashing
    // For demo purposes, we'll use a simple hash
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Check equality (for testing purposes)
   */
  public equals(other: Password): boolean {
    return this._hashedValue === other._hashedValue;
  }
}