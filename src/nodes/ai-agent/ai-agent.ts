import { runAgent } from "../../lib/agent-runner";
import { AgentError, ConfigurationError } from "../../lib/errors";
import { SessionMemoryStore } from "../../lib/memory/session-memory";
import { normalizeMsg } from "../../lib/normalize/normalize-msg";
import { createChatProvider } from "../../lib/providers/create-chat-provider";
import { setByPath } from "../../lib/utils/set-by-path";
import type { AiChatModelConfigNodeInstance } from "../ai-chat-model-config";

type NodeRedApi = {
    nodes: {
        createNode: (node: unknown, config: unknown) => void;
        registerType: (type: string, constructor: unknown) => void;
        getNode: (id: string | undefined) => unknown;
    };
};

type NodeMessage = Record<string, unknown>;

type AiAgentNodeConfig = {
    name?: string;
    modelConfig?: string;
    inputField?: string;
    systemField?: string;
    sessionField?: string;
    outputField?: string;
    maxIterations?: number | string;
    temperature?: number | string;
    maxTokens?: number | string;
    timeoutMs?: number | string;
    returnIntermediateSteps?: boolean;
};

interface AiAgentNodeInstance {
    name?: string;
    on: (
        event: string,
        callback: (
            msg: NodeMessage,
            send?: (msgs: unknown) => void,
            done?: (err?: unknown) => void
        ) => void | Promise<void>
    ) => void;
    send: (msgs: unknown) => void;
    error: (err: unknown, msg?: NodeMessage) => void;
    status: (status: { fill: string; shape: string; text: string }) => void;
}

function toOptionalNumber(value: number | string | undefined): number | undefined {
    if (value === undefined || value === "") {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function toPositiveInteger(value: number | string | undefined, fallback: number): number {
    const parsed = toOptionalNumber(value);

    if (!parsed || !Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
}

function formatError(error: unknown): {
    code: string;
    message: string;
    details?: unknown;
} {
    if (error instanceof AgentError) {
        return {
            code: error.code,
            message: error.message,
            details: error.details,
        };
    }

    if (error instanceof Error) {
        return {
            code: "UNEXPECTED_ERROR",
            message: error.message,
        };
    }

    return {
        code: "UNKNOWN_ERROR",
        message: "Erro desconhecido",
        details: error,
    };
}

export = function (RED: NodeRedApi): void {
    function AiAgentNode(this: AiAgentNodeInstance, config: AiAgentNodeConfig): void {
        RED.nodes.createNode(this, config);

        this.name = config.name;

        // Temporário nesta etapa:
        // memória local por instância do node até o ai-memory-session entrar.
        const memoryStore = new SessionMemoryStore({
            contextWindowLength: 12,
        });

        this.status({ fill: "blue", shape: "dot", text: "ready" });

        this.on(
            "input",
            async (
                msg: NodeMessage,
                send?: (msgs: unknown) => void,
                done?: (err?: unknown) => void
            ) => {
                const safeSend = send ?? ((msgs: unknown) => this.send(msgs));

                try {
                    this.status({ fill: "yellow", shape: "dot", text: "thinking" });

                    const modelNode = RED.nodes.getNode(config.modelConfig) as
                        | AiChatModelConfigNodeInstance
                        | undefined;

                    if (!modelNode) {
                        throw new ConfigurationError(
                            "Config node ai-chat-model-config não encontrado"
                        );
                    }

                    const modelConfig = modelNode.getResolvedConfig();

                    const provider = createChatProvider(modelConfig);

                    const normalized = normalizeMsg({
                        msg,
                        inputField: config.inputField ?? "payload",
                        systemField: config.systemField ?? "system",
                        sessionField: config.sessionField ?? "sessionId",
                    });

                    const result = await runAgent({
                        provider,
                        model: modelConfig.model,
                        userInput: normalized.inputText,
                        systemPrompt: normalized.systemPrompt,
                        sessionId: normalized.sessionId,
                        memory: normalized.sessionId ? memoryStore : undefined,
                        maxIterations: toPositiveInteger(config.maxIterations, 3),
                        temperature: toOptionalNumber(config.temperature),
                        maxTokens: toOptionalNumber(config.maxTokens),
                        timeoutMs: toOptionalNumber(config.timeoutMs) ?? modelConfig.timeoutMs,
                    });

                    const successMsg: NodeMessage = { ...msg };
                    const traceMsg: NodeMessage = { ...msg };

                    setByPath(
                        successMsg,
                        config.outputField ?? "payload",
                        result.finalText
                    );

                    successMsg.ai = {
                        provider: modelConfig.provider,
                        model: modelConfig.model,
                        usage: result.usage,
                        toolCalls: result.toolCalls,
                        finishReason: result.finishReason,
                        steps: result.traces,
                    };

                    traceMsg.ai = {
                        provider: modelConfig.provider,
                        model: modelConfig.model,
                        traces: result.traces,
                        toolCalls: result.toolCalls,
                    };

                    this.status({ fill: "green", shape: "dot", text: "done" });

                    safeSend([
                        successMsg,
                        config.returnIntermediateSteps ? traceMsg : null,
                        null,
                    ]);

                    if (done) {
                        done();
                    }
                } catch (error) {
                    const formattedError = formatError(error);

                    const errorMsg: NodeMessage = { ...msg };

                    errorMsg.error = formattedError;
                    errorMsg.ai = {
                        ...(typeof msg.ai === "object" && msg.ai !== null ? msg.ai : {}),
                        error: formattedError,
                    };

                    this.status({ fill: "red", shape: "ring", text: "error" });

                    safeSend([null, null, errorMsg]);

                    if (done) {
                        done();
                    } else {
                        this.error(error, msg);
                    }
                }
            }
        );
    }

    RED.nodes.registerType("ai-agent", AiAgentNode);
};