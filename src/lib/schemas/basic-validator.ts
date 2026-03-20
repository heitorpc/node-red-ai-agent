import type { SchemaValidator, ValidationResult } from "./common";

export class BasicSchemaValidator implements SchemaValidator {
    validate<T>(schema: Record<string, unknown>, input: unknown): ValidationResult<T> {
        const required = Array.isArray(schema.required) ? schema.required : [];

        if (schema.type === "object") {
            if (!input || typeof input !== "object" || Array.isArray(input)) {
                return { ok: false, errors: ["Input deve ser um objeto"] };
            }

            const record = input as Record<string, unknown>;
            const errors: string[] = [];

            for (const field of required) {
                if (!(field in record)) {
                    errors.push(`Campo obrigatório ausente: ${String(field)}`);
                }
            }

            return errors.length > 0
                ? { ok: false, errors }
                : { ok: true, value: input as T };
        }

        return { ok: true, value: input as T };
    }
}