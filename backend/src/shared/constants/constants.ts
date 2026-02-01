export const dayInMS = 7 * 24 * 60 * 60 * 1000;

export const AUTH_CONFIG = {
    accessExpires: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
