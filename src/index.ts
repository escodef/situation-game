import 'dotenv/config';
import { AppServer } from './app/server';
import { SampleBot } from './bot/bot';

async function bootstrap() {
    const server = new AppServer();
    const bot = new SampleBot(process.env.BOT_TOKEN!);

    await bot.start();
    await server.start();
}

bootstrap();
