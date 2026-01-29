export function asString(v?: string | string[]): string | undefined {
    return Array.isArray(v) ? v[0] : v;
}
