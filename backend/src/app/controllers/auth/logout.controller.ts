import { SessionRepo } from 'src/database/repositories';

export const logoutUser = async ({ headers, cookie: { refreshToken }, error }: any) => {
    const authHeader = headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return error(401, { success: false, message: 'Unauthorized' });
    }

    try {
        await SessionRepo.deleteByAccess(token);

        refreshToken.remove();

        return { success: true };
    } catch (e) {
        console.error('Logout Error:', e);
        return error(500, { success: false, message: 'Internal error' });
    }
};
