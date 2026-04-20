import { getOrThrow } from './utils';

export const dayInMS = 7 * 24 * 60 * 60 * 1000;

export const AUTH_CONFIG = {
    accessExpires: parseInt(getOrThrow(Bun.env.JWT_ACCESS_EXPIRES_IN), 10),
    accessExpiresMs: parseInt(getOrThrow(Bun.env.JWT_ACCESS_EXPIRES_IN), 10) * 1000,
    refreshExpires: parseInt(getOrThrow(Bun.env.JWT_REFRESH_EXPIRES_IN), 10),
    refreshExpiresMs: parseInt(getOrThrow(Bun.env.JWT_REFRESH_EXPIRES_IN), 10) * 1000,
    accessSecret: getOrThrow(Bun.env.JWT_ACCESS_SECRET),
    refreshSecret: getOrThrow(Bun.env.JWT_REFRESH_SECRET),
};
