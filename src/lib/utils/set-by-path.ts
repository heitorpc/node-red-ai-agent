export function setByPath(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
): void {
    const keys = path.split(".").filter(Boolean);

    if (keys.length === 0) {
        throw new Error("Path inválido");
    }

    let current: Record<string, unknown> = obj;

    for (let index = 0; index < keys.length - 1; index += 1) {
        const key = keys[index];
        const currentValue = current[key];

        if (!currentValue || typeof currentValue !== "object" || Array.isArray(currentValue)) {
            current[key] = {};
        }

        current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
}