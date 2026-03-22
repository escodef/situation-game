export const dayInMS = 7 * 24 * 60 * 60 * 1000;

export const AUTH_CONFIG = {
    accessExpires: parseInt(Bun.env.JWT_ACCESS_EXPIRES_IN || '', 10),
    accessExpiresMs: parseInt(Bun.env.JWT_ACCESS_EXPIRES_IN || '', 10) * 1000,
    refreshExpires: parseInt(Bun.env.JWT_REFRESH_EXPIRES_IN || '', 10),
    refreshExpiresMs: parseInt(Bun.env.JWT_REFRESH_EXPIRES_IN || '', 10) * 1000,
    accessSecret: Bun.env.JWT_ACCESS_SECRET || '',
    refreshSecret: Bun.env.JWT_REFRESH_SECRET || '',
};
