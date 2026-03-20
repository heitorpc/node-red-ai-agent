import { MemoryError, ValidationError } from "../errors";
import type { AgentMessage, MemoryReadParams, MemoryStore, MemoryWriteParams } from "../contracts/memory";

export interface SessionMemoryStoreOptions {
    contextWindowLength?: number;
}

export class SessionMemoryStore implements MemoryStore {
    private readonly store = new Map<string, AgentMessage[]>();
    private readonly contextWindowLength: number;

    constructor(options: SessionMemoryStoreOptions = {}) {
        const contextWindowLength = options.contextWindowLength ?? 20;

        if (!Number.isInteger(contextWindowLength) || contextWindowLength <= 0) {
            throw new ValidationError("contextWindowLength deve ser um inteiro maior que zero", {
                contextWindowLength,
            });
        }

        this.contextWindowLength = contextWindowLength;
    }

    async getMessages({ sessionId, limit }: MemoryReadParams): Promise<AgentMessage[]> {
        this.ensureSessionId(sessionId);

        const messages = this.store.get(sessionId) ?? [];
        const effectiveLimit = this.resolveLimit(limit);

        return messages.slice(-effectiveLimit);
    }

    async appendMessages({ sessionId, messages }: MemoryWriteParams): Promise<void> {
        this.ensureSessionId(sessionId);

        if (!Array.isArray(messages)) {
            throw new ValidationError("messages deve ser um array", {
                sessionId,
                receivedType: typeof messages,
            });
        }

        try {
            const current = this.store.get(sessionId) ?? [];
            const next = [...current, ...messages].slice(-this.contextWindowLength);

            this.store.set(sessionId, next);
        } catch (error) {
            throw new MemoryError("Falha ao gravar memória da sessão", {
                sessionId,
                cause: error,
            });
        }
    }

    async clear(sessionId: string): Promise<void> {
        this.ensureSessionId(sessionId);

        try {
            this.store.delete(sessionId);
        } catch (error) {
            throw new MemoryError("Falha ao limpar memória da sessão", {
                sessionId,
                cause: error,
            });
        }
    }

    private ensureSessionId(sessionId: string): void {
        if (typeof sessionId !== "string" || sessionId.trim() === "") {
            throw new ValidationError("sessionId é obrigatório e deve ser uma string não vazia", {
                sessionId,
            });
        }
    }

    private resolveLimit(limit?: number): number {
        if (limit === undefined) {
            return this.contextWindowLength;
        }

        if (!Number.isInteger(limit) || limit <= 0) {
            throw new ValidationError("limit deve ser um inteiro maior que zero", {
                limit,
            });
        }

        return Math.min(limit, this.contextWindowLength);
    }
}