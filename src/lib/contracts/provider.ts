export interface ProviderToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
}

export interface ProviderGenerateParams {
    model: string;
    messages: Array<{
        role: "system" | "user" | "assistant" | "tool";
        content: string;
        name?: string;
        toolCallId?: string;
    }>;
    tools?: ProviderToolDefinition[];
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
}

export interface ProviderToolCall {
    id: string;
    name: string;
    input: Record<string, unknown>;
}

export interface ProviderGenerateResult {
    text?: string;
    toolCalls?: ProviderToolCall[];
    finishReason?: string;
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
    raw?: unknown;
}

export interface ChatProvider {
    readonly name: string;
    generate(params: ProviderGenerateParams): Promise<ProviderGenerateResult>;
}