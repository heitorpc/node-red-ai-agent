import { ValidationError } from "../errors";
import { getByPath } from "../utils/get-by-path";

export type NodeMessage = Record<string, unknown>;

export interface NormalizedAgentInput {
    inputText: string;
    systemPrompt?: string;
    sessionId?: string;
    contextData?: unknown;
    tools?: unknown[];
    originalMsg: NodeMessage;
}

export interface NormalizeMsgParams {
    msg: NodeMessage;
    inputField?: string;
    systemField?: string;
    sessionField?: string;
    contextField?: string;
    toolsField?: string;
}

export function normalizeMsg({
    msg,
    inputField = "payload",
    systemField = "system",
    sessionField = "sessionId",
    contextField = "contextData",
    toolsField = "tools",
}: NormalizeMsgParams): NormalizedAgentInput {
    const rawInput = getByPath(msg, inputField);
    const rawSystem = getByPath(msg, systemField);
    const rawSession = getByPath(msg, sessionField);
    const rawContext = getByPath(msg, contextField);
    const rawTools = getByPath(msg, toolsField);

    if (typeof rawInput !== "string" || rawInput.trim() === "") {
        throw new ValidationError(`Campo de entrada inválido em msg.${inputField}`, {
            field: inputField,
            receivedType: typeof rawInput,
            receivedValue: rawInput,
        });
    }

    if (rawSystem !== undefined && typeof rawSystem !== "string") {
        throw new ValidationError(`Campo de system inválido em msg.${systemField}`, {
            field: systemField,
            receivedType: typeof rawSystem,
            receivedValue: rawSystem,
        });
    }

    if (rawSession !== undefined && typeof rawSession !== "string") {
        throw new ValidationError(`Campo de sessionId inválido em msg.${sessionField}`, {
            field: sessionField,
            receivedType: typeof rawSession,
            receivedValue: rawSession,
        });
    }

    if (rawTools !== undefined && !Array.isArray(rawTools)) {
        throw new ValidationError(`Campo de tools inválido em msg.${toolsField}`, {
            field: toolsField,
            receivedType: typeof rawTools,
            receivedValue: rawTools,
        });
    }

    return {
        inputText: rawInput,
        systemPrompt: typeof rawSystem === "string" ? rawSystem : undefined,
        sessionId: typeof rawSession === "string" ? rawSession : undefined,
        contextData: rawContext,
        tools: Array.isArray(rawTools) ? rawTools : undefined,
        originalMsg: msg,
    };
}