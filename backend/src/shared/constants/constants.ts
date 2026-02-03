export const dayInMS = 7 * 24 * 60 * 60 * 1000;

export const AUTH_CONFIG = {
    accessExpires: parseInt(process.env.JWT_ACCESS_EXPIRES_IN, 10),
    accessExpiresMs: parseInt(process.env.JWT_ACCESS_EXPIRES_IN, 10) * 1000,
    refreshExpires: parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10),
    refreshExpiresMs: parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10) * 1000,
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
};
