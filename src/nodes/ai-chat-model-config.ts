import type { ResolvedChatModelConfig } from "../lib/providers/create-chat-provider";

type NodeRedApi = {
    nodes: {
        createNode: (node: unknown, config: unknown) => void;
        registerType: (type: string, constructor: unknown) => void;
    };
};

type AiChatModelConfigNodeConfig = {
    name?: string;
    provider?: string;
    model?: string;
    baseUrl?: string;
    timeoutMs?: number | string;
    maxRetries?: number | string;
    organization?: string;
    project?: string;
    extraHeadersJson?: string;
};

interface AiChatModelConfigCredentials {
    apiKey?: string;
}

export interface AiChatModelConfigNodeInstance {
    name?: string;
    provider: string;
    model: string;
    baseUrl?: string;
    timeoutMs?: number;
    maxRetries?: number;
    organization?: string;
    project?: string;
    credentials?: AiChatModelConfigCredentials;
    getResolvedConfig: () => ResolvedChatModelConfig;
}

function toOptionalNumber(value: number | string | undefined): number | undefined {
    if (value === undefined || value === "") {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function parseExtraHeaders(extraHeadersJson?: string): Record<string, string> | undefined {
    if (!extraHeadersJson || extraHeadersJson.trim() === "") {
        return undefined;
    }

    const parsed = JSON.parse(extraHeadersJson) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("extraHeadersJson deve ser um objeto JSON");
    }

    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== "string") {
            throw new Error(`Header extra inválido para '${key}'`);
        }

        result[key] = value;
    }

    return result;
}

module.exports = function (RED: NodeRedApi): void {
    function AiChatModelConfigNode(
        this: AiChatModelConfigNodeInstance,
        config: AiChatModelConfigNodeConfig
    ): void {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.provider = config.provider ?? "openai";
        this.model = config.model ?? "gpt-4o-mini";
        this.baseUrl = config.baseUrl;
        this.timeoutMs = toOptionalNumber(config.timeoutMs);
        this.maxRetries = toOptionalNumber(config.maxRetries);
        this.organization = config.organization;
        this.project = config.project;

        this.getResolvedConfig = (): ResolvedChatModelConfig => {
            const apiKey = this.credentials?.apiKey ?? "";

            return {
                provider: this.provider,
                model: this.model,
                apiKey,
                baseUrl: this.baseUrl,
                timeoutMs: this.timeoutMs,
                maxRetries: this.maxRetries,
                organization: this.organization,
                project: this.project,
                extraHeaders: parseExtraHeaders(config.extraHeadersJson),
            };
        };
    }

    RED.nodes.registerType("ai-chat-model-config", AiChatModelConfigNode);
};