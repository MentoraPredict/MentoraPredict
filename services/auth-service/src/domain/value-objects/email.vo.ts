// Value Object: Email — immutable, self-validating
export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.trim().toLowerCase();
  }

  static create(raw: string): Email {
    if (!raw || !Email.isValid(raw)) {
      throw new Error(`Invalid email: ${raw}`);
    }
    return new Email(raw);
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
