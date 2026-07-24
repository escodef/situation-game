import { getRandomValues } from 'node:crypto';

export const generateRandomString = (length: number = 6): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint8Array(length);

    getRandomValues(array);

    let result = '';
    for (const byte of array) {
        result += chars[byte % chars.length];
    }
    return result;
};
