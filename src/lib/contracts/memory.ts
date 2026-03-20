export interface AgentMessage {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    name?: string;
    toolCallId?: string;
}

export interface MemoryReadParams {
    sessionId: string;
    limit?: number;
}

export interface MemoryWriteParams {
    sessionId: string;
    messages: AgentMessage[];
}

export interface MemoryStore {
    getMessages(params: MemoryReadParams): Promise<AgentMessage[]>;
    appendMessages(params: MemoryWriteParams): Promise<void>;
    clear(sessionId: string): Promise<void>;
}