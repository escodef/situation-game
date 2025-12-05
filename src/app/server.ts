import express from 'express';
import appRouter from './routes/app.router';

export const createApp = () => {
    const app = express();
    const PORT = Bun.env.PORT || 3000;

    app.use(express.json());

    app.get('/', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'сосируй',
        });
    });

    app.use(appRouter);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};
