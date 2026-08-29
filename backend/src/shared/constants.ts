import { getOrThrow } from './utils';

export const dayInMS = 24 * 60 * 60 * 1000;

export const AUTH_CONFIG = {
    accessExpires: Number.parseInt(getOrThrow(Bun.env.JWT_ACCESS_EXPIRES_IN), 10),
    accessExpiresMs: Number.parseInt(getOrThrow(Bun.env.JWT_ACCESS_EXPIRES_IN), 10) * 1000,
    refreshExpires: Number.parseInt(getOrThrow(Bun.env.JWT_REFRESH_EXPIRES_IN), 10),
    refreshExpiresMs: Number.parseInt(getOrThrow(Bun.env.JWT_REFRESH_EXPIRES_IN), 10) * 1000,
    accessSecret: getOrThrow(Bun.env.JWT_ACCESS_SECRET),
    refreshSecret: getOrThrow(Bun.env.JWT_REFRESH_SECRET),
};
