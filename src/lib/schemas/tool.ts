export const toolDefinitionSchema = {
    type: "object",
    required: ["name", "description", "inputSchema", "execute"],
};