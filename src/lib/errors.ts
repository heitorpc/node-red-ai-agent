export class AgentError extends Error {
    public readonly code: string;
    public readonly details?: unknown;

    constructor(message: string, code: string, details?: unknown) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        this.details = details;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ValidationError extends AgentError {
    constructor(message: string, details?: unknown) {
        super(message, "VALIDATION_ERROR", details);
    }
}

export class ProviderError extends AgentError {
    constructor(message: string, details?: unknown) {
        super(message, "PROVIDER_ERROR", details);
    }
}

export class ToolExecutionError extends AgentError {
    constructor(message: string, details?: unknown) {
        super(message, "TOOL_EXECUTION_ERROR", details);
    }
}

export class MemoryError extends AgentError {
    constructor(message: string, details?: unknown) {
        super(message, "MEMORY_ERROR", details);
    }
}

export class ConfigurationError extends AgentError {
    constructor(message: string, details?: unknown) {
        super(message, "CONFIGURATION_ERROR", details);
    }
}

export class InternalAgentError extends AgentError {
    constructor(message: string, details?: unknown) {
        super(message, "INTERNAL_AGENT_ERROR", details);
    }
}