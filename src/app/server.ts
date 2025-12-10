import Bun from 'bun';
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

    const server = Bun.serve({
        fetch(req, server) {
            const url = new URL(req.url);

            // сделать проверку есть ли в ссылке /ws (или как то нужно по другому придумать как отличать обычные рест запросы, от подруба сокету)
            // тут из headers нужно взять токен пользователя, сделать запрос в бд, найти его и вызвать websocket manager instanse
            // чтобы воспользоваться методом handleConnection (котоорый сохранит пользователя в map структуру)
        },
        websocket: {
            data: {} as { username: string }, // это данные )))))
            open(ws) {
                // тут наверноие и ниче не надо пока что, проверку на авторизацию делается в fetch
            },
            message(ws, message) {
                /// ооо а вот тут поебаться нужно будет, нужно сделать websocket.handler.ts файл, в нем нужно сделать функцию handleMessage
                // в handleMessage нужно будет во первых проверку на валидность данных сделать, соотвествует ли данные структуре {eventName: string, data: T}
                // во вторых нужно будет вызывать processors (это хуйни которые будут выполнять саму логику события),
                // допустим пришло событие ban (забанить пользователя в руме (это как пример просто)), в handleMessage
                // полетит новое событие, в свою очередь эта функция пробежится по switch-case,
                // проверит есть ли processor для такого eventName, если да,
                // тогда вызываем функцию (которая реализует логику бана) из ban.proccessor.ts
                // опять же если простым языком processor это как метод в service в несте
            },
            close(ws) {
                // тут вызвать из инстанса сокет менеджера handleDisconection чтобы убрать из map пользователя
            },
        },
    });

    console.log(
        `Websocket is running on port ${server.hostname}:${server.port}`
    );

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};
