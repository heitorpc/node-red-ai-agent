// export type JsonPrimitive = string | number | boolean | null;
// export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

// export interface JsonObject {
//     [key: string]: JsonValue;
// }

// export interface AgentMessage {
//     role: "system" | "user" | "assistant" | "tool";
//     content: string;
//     name?: string;
//     toolCallId?: string;
// }

// export interface ProviderToolCall {
//     id: string;
//     name: string;
//     input: Record<string, unknown>;
// }

// export interface TokenUsage {
//     inputTokens?: number;
//     outputTokens?: number;
//     totalTokens?: number;
// }

// export interface AgentTraceEvent {
//     type:
//     | "run:start"
//     | "run:end"
//     | "provider:request"
//     | "provider:response"
//     | "tool:start"
//     | "tool:end"
//     | "memory:read"
//     | "memory:write"
//     | "error";
//     at: string;
//     data?: unknown;
// }

// export interface ToolCallResult {
//     id: string;
//     name: string;
//     input: Record<string, unknown>;
//     output?: unknown;
//     error?: {
//         message: string;
//         details?: unknown;
//     };
// }

// export interface AgentRunResult {
//     finalText: string;
//     messages: AgentMessage[];
//     toolCalls: ToolCallResult[];
//     finishReason?: string;
//     usage?: TokenUsage;
//     traces: AgentTraceEvent[];
// }