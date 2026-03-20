import { ConfigurationError } from "../errors";
import type { ChatProvider } from "../contracts/provider";
import { OpenAIChatProvider } from "./openai/openai-provider";

export interface ResolvedChatModelConfig {
    provider: string;
    model: string;
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
    maxRetries?: number;
    organization?: string;
    project?: string;
    extraHeaders?: Record<string, string>;
}

export function createChatProvider(config: ResolvedChatModelConfig): ChatProvider {
    switch (config.provider) {
        case "openai":
            return new OpenAIChatProvider({
                apiKey: config.apiKey,
                baseUrl: config.baseUrl,
                timeoutMs: config.timeoutMs,
                maxRetries: config.maxRetries,
                organization: config.organization,
                project: config.project,
                defaultHeaders: config.extraHeaders,
            });

        default:
            throw new ConfigurationError(`Provider não suportado: ${config.provider}`, {
                provider: config.provider,
            });
    }
}