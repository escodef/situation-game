import { verifyAccessToken } from 'src/shared/utils/jwt.util';
import type { TokenPayload } from '../interfaces';

export const authenticate = async (
    req: Request,
): Promise<{ error: Response; user: TokenPayload }> => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return {
            error: Response.json(
                {
                    success: false,
                    message: 'Unauthorized. No token provided.',
                },
                { status: 401 },
            ),
            user: null,
        };
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return {
            error: Response.json(
                {
                    success: false,
                    message: 'Forbidden - Invalid or expired token',
                },
                { status: 403 },
            ),
            user: null,
        };
    }

    return { error: null, user: decoded };
};
