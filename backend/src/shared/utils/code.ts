import { randomInt } from 'node:crypto';

export function generateCode(): string {
    const code = randomInt(0, 10000);
    return code.toString().padStart(4, '0');
}
