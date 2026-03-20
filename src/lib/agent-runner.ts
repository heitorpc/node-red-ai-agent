import { InternalAgentError, ProviderError, ToolExecutionError, ValidationError } from "./errors";
import type { ChatProvider } from "./contracts/provider";
import type { AgentMessage, MemoryStore } from "./contracts/memory";
import { ToolRegistry } from "./tools/registry";

export interface AgentTraceEvent {
    type:
    | "run:start"
    | "run:end"
    | "provider:request"
    | "provider:response"
    | "tool:start"
    | "tool:end"
    | "memory:read"
    | "memory:write"
    | "error";
    at: string;
    data?: unknown;
}

export interface ToolCallResult {
    id: string;
    name: string;
    input: Record<string, unknown>;
    output?: unknown;
    error?: {
        message: string;
        details?: unknown;
    };
}

export interface AgentRunParams {
    provider: ChatProvider;
    model: string;
    userInput: string;
    systemPrompt?: string;
    sessionId?: string;
    memory?: MemoryStore;
    tools?: ToolRegistry;
    maxIterations: number;
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
}

export interface AgentRunResult {
    finalText: string;
    messages: AgentMessage[];
    toolCalls: ToolCallResult[];
    finishReason?: string;
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
    traces: AgentTraceEvent[];
}

export async function runAgent(params: AgentRunParams): Promise<AgentRunResult> {
    validateRunParams(params);

    const traces: AgentTraceEvent[] = [];
    const toolCalls: ToolCallResult[] = [];
    const messages: AgentMessage[] = [];

    traces.push({
        type: "run:start",
        at: new Date().toISOString(),
        data: {
            provider: params.provider.name,
            model: params.model,
            sessionId: params.sessionId,
            maxIterations: params.maxIterations,
        },
    });

    try {
        if (params.systemPrompt) {
            messages.push({
                role: "system",
                content: params.systemPrompt,
            });
        }

        if (params.memory && params.sessionId) {
            traces.push({
                type: "memory:read",
                at: new Date().toISOString(),
                data: { sessionId: params.sessionId },
            });

            const history = await params.memory.getMessages({
                sessionId: params.sessionId,
            });

            messages.push(...history);
        }

        messages.push({
            role: "user",
            content: params.userInput,
        });

        let iteration = 0;
        let finalText = "";
        let finishReason: string | undefined;
        let usage: AgentRunResult["usage"];

        while (iteration < params.maxIterations) {
            iteration += 1;

            traces.push({
                type: "provider:request",
                at: new Date().toISOString(),
                data: {
                    iteration,
                    messageCount: messages.length,
                },
            });

            let providerResult;
            try {
                providerResult = await params.provider.generate({
                    model: params.model,
                    messages,
                    tools: params.tools?.list().map((tool) => ({
                        name: tool.name,
                        description: tool.description,
                        inputSchema: tool.inputSchema,
                    })),
                    temperature: params.temperature,
                    maxTokens: params.maxTokens,
                    timeoutMs: params.timeoutMs,
                });
            } catch (error) {
                throw new ProviderError("Falha ao chamar o provider", { cause: error });
            }

            traces.push({
                type: "provider:response",
                at: new Date().toISOString(),
                data: {
                    iteration,
                    finishReason: providerResult.finishReason,
                    hasText: Boolean(providerResult.text),
                    toolCalls: providerResult.toolCalls?.length ?? 0,
                },
            });

            usage = providerResult.usage;
            finishReason = providerResult.finishReason;

            if (providerResult.text) {
                messages.push({
                    role: "assistant",
                    content: providerResult.text,
                });

                finalText = providerResult.text;
            }

            if (!providerResult.toolCalls || providerResult.toolCalls.length === 0) {
                break;
            }

            if (!params.tools) {
                throw new ToolExecutionError("O provider solicitou tool calls, mas nenhum ToolRegistry foi fornecido", {
                    requestedTools: providerResult.toolCalls.map((toolCall) => toolCall.name),
                });
            }

            for (const toolCall of providerResult.toolCalls) {
                const tool = params.tools.get(toolCall.name);

                if (!tool) {
                    const notFoundError = {
                        message: `Tool não encontrada: ${toolCall.name}`,
                    };

                    toolCalls.push({
                        id: toolCall.id,
                        name: toolCall.name,
                        input: toolCall.input,
                        error: notFoundError,
                    });

                    messages.push({
                        role: "tool",
                        toolCallId: toolCall.id,
                        name: toolCall.name,
                        content: JSON.stringify({ error: notFoundError.message }),
                    });

                    continue;
                }

                traces.push({
                    type: "tool:start",
                    at: new Date().toISOString(),
                    data: {
                        iteration,
                        toolName: tool.name,
                        toolCallId: toolCall.id,
                    },
                });

                try {
                    const output = await tool.execute(toolCall.input, {
                        sessionId: params.sessionId,
                        timeoutMs: params.timeoutMs ?? 30_000,
                    });

                    toolCalls.push({
                        id: toolCall.id,
                        name: toolCall.name,
                        input: toolCall.input,
                        output,
                    });

                    messages.push({
                        role: "tool",
                        toolCallId: toolCall.id,
                        name: tool.name,
                        content: JSON.stringify(output),
                    });

                    traces.push({
                        type: "tool:end",
                        at: new Date().toISOString(),
                        data: {
                            iteration,
                            toolName: tool.name,
                            toolCallId: toolCall.id,
                            ok: true,
                        },
                    });
                } catch (error) {
                    const wrappedError = new ToolExecutionError(
                        `Falha ao executar tool: ${tool.name}`,
                        { cause: error, toolName: tool.name, toolCallId: toolCall.id }
                    );

                    toolCalls.push({
                        id: toolCall.id,
                        name: toolCall.name,
                        input: toolCall.input,
                        error: {
                            message: wrappedError.message,
                            details: wrappedError.details,
                        },
                    });

                    messages.push({
                        role: "tool",
                        toolCallId: toolCall.id,
                        name: tool.name,
                        content: JSON.stringify({
                            error: wrappedError.message,
                        }),
                    });

                    traces.push({
                        type: "tool:end",
                        at: new Date().toISOString(),
                        data: {
                            iteration,
                            toolName: tool.name,
                            toolCallId: toolCall.id,
                            ok: false,
                        },
                    });
                }
            }
        }

        if (!finalText) {
            throw new ProviderError("O provider não retornou texto final", {
                finishReason,
            });
        }

        if (params.memory && params.sessionId) {
            traces.push({
                type: "memory:write",
                at: new Date().toISOString(),
                data: { sessionId: params.sessionId },
            });

            await params.memory.appendMessages({
                sessionId: params.sessionId,
                messages: [
                    {
                        role: "user",
                        content: params.userInput,
                    },
                    {
                        role: "assistant",
                        content: finalText,
                    },
                ],
            });
        }

        traces.push({
            type: "run:end",
            at: new Date().toISOString(),
            data: {
                finishReason,
                toolCalls: toolCalls.length,
            },
        });

        return {
            finalText,
            messages,
            toolCalls,
            finishReason,
            usage,
            traces,
        };
    } catch (error) {
        traces.push({
            type: "error",
            at: new Date().toISOString(),
            data: {
                message: error instanceof Error ? error.message : "Erro desconhecido",
            },
        });

        if (error instanceof Error) {
            throw error;
        }

        throw new InternalAgentError("Falha inesperada no agent runner", {
            cause: error,
        });
    }
}

function validateRunParams(params: AgentRunParams): void {
    if (!params.provider) {
        throw new ValidationError("provider é obrigatório");
    }

    if (typeof params.model !== "string" || params.model.trim() === "") {
        throw new ValidationError("model é obrigatório e deve ser uma string não vazia", {
            model: params.model,
        });
    }

    if (typeof params.userInput !== "string" || params.userInput.trim() === "") {
        throw new ValidationError("userInput é obrigatório e deve ser uma string não vazia", {
            userInput: params.userInput,
        });
    }

    if (!Number.isInteger(params.maxIterations) || params.maxIterations <= 0) {
        throw new ValidationError("maxIterations deve ser um inteiro maior que zero", {
            maxIterations: params.maxIterations,
        });
    }
}