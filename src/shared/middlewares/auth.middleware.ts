import { Response } from 'express';
import { verify } from 'jsonwebtoken';
import { UserRequest } from '../interfaces';

const authenticate = (req: UserRequest, res: Response, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized. No token provided.',
        });
    }
    try {
        const decoded = verify(token, process.env.JWT_ACCESS_SECRET);

        req.player = decoded;

        next();
    } catch {
        return res.status(403).json({
            message: 'Forbidden - Invalid or expired token',
        });
    }
};
