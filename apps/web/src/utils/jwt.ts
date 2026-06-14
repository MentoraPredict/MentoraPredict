export function decodeJwtPayload<T>(
    token: string
): T | null {
    const parts = token.split(".");
    if (parts.length !== 3) {
        return null;
    }

    try {
        const base64Url = parts[1];
        const base64 = base64Url
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const padded = base64.padEnd(
            Math.ceil(base64.length / 4) * 4,
            "="
        );
        const json = atob(padded);
        return JSON.parse(json) as T;
    } catch {
        return null;
    }
}
