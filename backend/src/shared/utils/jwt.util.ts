import { sign, verify } from 'jsonwebtoken';
import { AUTH_CONFIG } from '../constants';
import { TokenPayload } from '../interfaces';

export const generateTokens = (payload: TokenPayload) => {
    const accessToken = sign(payload, AUTH_CONFIG.accessSecret, {
        expiresIn: AUTH_CONFIG.accessExpires,
    });

    const refreshToken = sign(payload, AUTH_CONFIG.refreshSecret, {
        expiresIn: AUTH_CONFIG.refreshExpires,
    });

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
    try {
        return verify(token, AUTH_CONFIG.accessSecret) as TokenPayload;
    } catch {
        return null;
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return verify(token, AUTH_CONFIG.refreshSecret) as TokenPayload;
    } catch {
        return null;
    }
};
