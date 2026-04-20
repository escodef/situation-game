export function getOrThrow<T>(key: T) {
    if (!key) throw new Error(`Key is undefined`);
    return key;
}
