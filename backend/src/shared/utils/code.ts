export function generateCode(): string {
    const randomValue = crypto.getRandomValues(new Uint16Array(1))[0];
    return (randomValue % 10000).toString().padStart(4, '0');
}
