import { env } from './env';

export const dayInMS = 24 * 60 * 60 * 1000;

export const AUTH_CONFIG = {
    accessExpires: env.JWT_ACCESS_EXPIRES_IN,
    accessExpiresMs: env.JWT_ACCESS_EXPIRES_IN * 1000,
    refreshExpires: env.JWT_REFRESH_EXPIRES_IN,
    refreshExpiresMs: env.JWT_REFRESH_EXPIRES_IN * 1000,
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
};
