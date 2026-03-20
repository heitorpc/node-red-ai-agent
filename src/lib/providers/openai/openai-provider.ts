import OpenAI from "openai";

import { ProviderError, ValidationError } from "../../errors";
import type {
    ChatProvider,
    ProviderGenerateParams,
    ProviderGenerateResult,
    ProviderToolDefinition,
} from "../../contracts/provider";

export interface OpenAIChatProviderOptions {
    apiKey: string;
    baseUrl?: string;
    organization?: string;
    project?: string;
    defaultHeaders?: Record<string, string>;
    timeoutMs?: number;
    maxRetries?: number;
}

type ChatMessage = {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    name?: string;
    toolCallId?: string;
};

export class OpenAIChatProvider implements ChatProvider {
    public readonly name = "openai";

    private readonly client: OpenAI;

    constructor(options: OpenAIChatProviderOptions) {
        if (typeof options.apiKey !== "string" || options.apiKey.trim() === "") {
            throw new ValidationError("apiKey do OpenAI é obrigatório");
        }

        this.client = new OpenAI({
            apiKey: options.apiKey,
            baseURL: options.baseUrl,
            organization: options.organization,
            project: options.project,
            defaultHeaders: options.defaultHeaders,
            timeout: options.timeoutMs,
            maxRetries: options.maxRetries ?? 2,
        });
    }

    async generate(params: ProviderGenerateParams): Promise<ProviderGenerateResult> {
        this.validateParams(params);

        try {
            const response = await this.client.chat.completions.create(
                {
                    model: params.model,
                    messages: this.mapMessages(params.messages),
                    ...(params.tools && params.tools.length > 0
                        ? { tools: params.tools.map((tool) => this.mapTool(tool)) }
                        : {}),
                    ...(typeof params.temperature === "number"
                        ? { temperature: params.temperature }
                        : {}),
                },
                typeof params.timeoutMs === "number"
                    ? { timeout: params.timeoutMs }
                    : undefined
            );

            const choice = response.choices?.[0];

            if (!choice?.message) {
                throw new ProviderError("OpenAI não retornou uma message válida", {
                    responseId: response.id,
                });
            }

            const message = choice.message;
            const text = this.extractAssistantText(message.content);
            const toolCalls = this.extractToolCalls(message.tool_calls);

            return {
                text,
                toolCalls,
                finishReason: choice.finish_reason ?? undefined,
                usage: response.usage
                    ? {
                        inputTokens: response.usage.prompt_tokens,
                        outputTokens: response.usage.completion_tokens,
                        totalTokens: response.usage.total_tokens,
                    }
                    : undefined,
                raw: response,
            };
        } catch (error) {
            if (error instanceof ProviderError || error instanceof ValidationError) {
                throw error;
            }

            throw new ProviderError("Falha ao chamar o provider OpenAI", {
                cause: error,
            });
        }
    }

    private validateParams(params: ProviderGenerateParams): void {
        if (typeof params.model !== "string" || params.model.trim() === "") {
            throw new ValidationError("model é obrigatório para o provider OpenAI", {
                model: params.model,
            });
        }

        if (!Array.isArray(params.messages) || params.messages.length === 0) {
            throw new ValidationError("messages deve ser um array não vazio", {
                messages: params.messages,
            });
        }
    }

    private mapMessages(messages: ChatMessage[]) {
        return messages.map((message) => {
            if (message.role === "tool") {
                if (!message.toolCallId) {
                    throw new ValidationError("Mensagem com role 'tool' exige toolCallId", {
                        message,
                    });
                }

                return {
                    role: "tool" as const,
                    tool_call_id: message.toolCallId,
                    content: message.content,
                };
            }

            if (message.role === "assistant") {
                return {
                    role: "assistant" as const,
                    content: message.content,
                };
            }

            if (message.role === "system") {
                return {
                    role: "system" as const,
                    content: message.content,
                };
            }

            return {
                role: "user" as const,
                content: message.content,
            };
        });
    }

    private mapTool(tool: ProviderToolDefinition) {
        return {
            type: "function" as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema,
                strict: true,
            },
        };
    }

    private extractAssistantText(content: unknown): string | undefined {
        if (typeof content === "string") {
            return content;
        }

        if (Array.isArray(content)) {
            const parts = content
                .map((part) => {
                    if (typeof part === "string") {
                        return part;
                    }

                    if (
                        part &&
                        typeof part === "object" &&
                        "type" in part &&
                        "text" in part &&
                        (part as { type?: unknown }).type === "text" &&
                        typeof (part as { text?: unknown }).text === "string"
                    ) {
                        return (part as { text: string }).text;
                    }

                    return "";
                })
                .filter(Boolean);

            return parts.length > 0 ? parts.join("") : undefined;
        }

        return undefined;
    }

    private extractToolCalls(toolCalls: unknown): ProviderGenerateResult["toolCalls"] {
        if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
            return undefined;
        }

        return toolCalls.map((toolCall) => {
            if (
                !toolCall ||
                typeof toolCall !== "object" ||
                !("id" in toolCall) ||
                !("function" in toolCall)
            ) {
                throw new ProviderError("Tool call inválida retornada pelo OpenAI", {
                    toolCall,
                });
            }

            const fn = (toolCall as {
                function?: { name?: unknown; arguments?: unknown };
            }).function;

            const id = (toolCall as { id?: unknown }).id;

            if (
                !fn ||
                typeof fn.name !== "string" ||
                typeof fn.arguments !== "string" ||
                typeof id !== "string"
            ) {
                throw new ProviderError("Tool call do OpenAI está incompleta", {
                    toolCall,
                });
            }

            let parsedArguments: Record<string, unknown>;

            try {
                const parsed = JSON.parse(fn.arguments);

                if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                    throw new Error("arguments não é um objeto JSON");
                }

                parsedArguments = parsed as Record<string, unknown>;
            } catch (error) {
                throw new ProviderError("OpenAI retornou arguments inválidos em tool call", {
                    toolName: fn.name,
                    rawArguments: fn.arguments,
                    cause: error,
                });
            }

            return {
                id,
                name: fn.name,
                input: parsedArguments,
            };
        });
    }
}