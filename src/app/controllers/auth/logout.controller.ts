import { RefreshTokenRepo } from 'src/database/repositories/refresh-token.repo';

export const logoutUser = async (req: Request): Promise<Response> => {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return Response.json({ success: false, message: 'Unathorized' }, { status: 401 });
        }

        await RefreshTokenRepo.deleteByAccess(token);
    } catch (error) {
        console.error('Login Error:', error);
        return Response.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
};
