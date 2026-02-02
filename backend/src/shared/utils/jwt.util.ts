import { sign, verify } from 'jsonwebtoken';
import { AUTH_CONFIG } from '../constants';
import { TokenPayload } from '../interfaces';

export const generateTokens = (payload: TokenPayload) => {
    const accessToken = sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: (AUTH_CONFIG.accessExpires as any) || '15m',
    });

    const refreshToken = sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: (AUTH_CONFIG.refreshExpires as any) || '7d',
    });

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
    try {
        return verify(token, process.env.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
        return null;
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return verify(token, process.env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
        return null;
    }
};
