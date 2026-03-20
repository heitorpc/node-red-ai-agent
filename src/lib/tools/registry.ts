import { ConfigurationError } from "../errors";
import type { SchemaValidator } from "../schemas/common";
import { type ToolDefinition, toolDefinitionSchema } from "../schemas/tool";

export class ToolRegistry {
    private readonly tools = new Map<string, ToolDefinition>();

    constructor(private readonly validator?: SchemaValidator) { }

    register(tool: ToolDefinition): void {
        if (this.validator) {
            const result = this.validator.validate<ToolDefinition>(toolDefinitionSchema, tool);

            if (!result.ok) {
                throw new ConfigurationError("Definição de tool inválida", {
                    errors: result.errors,
                    toolName: tool?.name,
                });
            }
        }

        const normalizedName = this.normalizeName(tool.name);

        if (this.tools.has(normalizedName)) {
            throw new ConfigurationError(`Tool já registrada: ${tool.name}`, {
                toolName: tool.name,
            });
        }

        this.tools.set(normalizedName, {
            ...tool,
            name: normalizedName,
        });
    }

    registerMany(tools: ToolDefinition[]): void {
        for (const tool of tools) {
            this.register(tool);
        }
    }

    get(name: string): ToolDefinition | undefined {
        return this.tools.get(this.normalizeName(name));
    }

    has(name: string): boolean {
        return this.tools.has(this.normalizeName(name));
    }

    list(): ToolDefinition[] {
        return [...this.tools.values()];
    }

    clear(): void {
        this.tools.clear();
    }

    private normalizeName(name: string): string {
        const normalized = name.trim();

        if (!normalized) {
            throw new ConfigurationError("Nome da tool não pode ser vazio");
        }

        return normalized;
    }
}