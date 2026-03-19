type NodeRedApi = {
    nodes: {
        createNode: (node: unknown, config: unknown) => void;
        registerType: (type: string, constructor: unknown) => void;
    };
};

type AiAgentNodeConfig = {
    name?: string;
};

type NodeMessage = Record<string, unknown>;

interface AiAgentNodeInstance {
    name?: string;
    on: (
        event: string,
        callback: (msg: NodeMessage, send?: (...args: unknown[]) => void, done?: (err?: unknown) => void) => void
    ) => void;
    send: (...args: unknown[]) => void;
    error: (err: unknown, msg: NodeMessage) => void;
    status: (status: { fill: string; shape: string; text: string }) => void;
}

export = function (RED: NodeRedApi): void {
    function AiAgentNode(this: AiAgentNodeInstance, config: AiAgentNodeConfig): void {
        RED.nodes.createNode(this, config);

        this.name = config.name;

        this.status({ fill: "blue", shape: "dot", text: "ready" });

        this.on("input", (msg: NodeMessage, send?: (...args: unknown[]) => void, done?: (err?: unknown) => void) => {
            const safeSend = send ?? ((...args: unknown[]) => this.send(...args));

            try {
                safeSend(msg);

                if (done) {
                    done();
                }
            } catch (error) {
                if (done) {
                    done(error);
                } else {
                    this.error(error, msg);
                }
            }
        });
    }

    RED.nodes.registerType("ai-agent", AiAgentNode);
};