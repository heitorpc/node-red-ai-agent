export interface ValidationResult<T> {
    ok: boolean;
    value?: T;
    errors?: string[];
}

export interface SchemaValidator {
    validate<T>(schema: Record<string, unknown>, input: unknown): ValidationResult<T>;
}