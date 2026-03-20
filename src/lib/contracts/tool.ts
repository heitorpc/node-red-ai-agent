export type ToolInput = Record<string, unknown>;
export type ToolOutput = unknown;

export interface ToolExecutionContext {
    sessionId?: string;
    timeoutMs: number;
    metadata?: Record<string, unknown>;
}

export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: (input: ToolInput, ctx: ToolExecutionContext) => Promise<ToolOutput>;
}