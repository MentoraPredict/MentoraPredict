// Value Object: Password — wraps plain text pre-hashing
// After hashing, only the hash is stored (never the raw password)
export class Password {
  private constructor(private readonly _raw: string) {}

  static create(raw: string): Password {
    if (!raw || raw.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    return new Password(raw);
  }

  get raw(): string {
    return this._raw;
  }
}
