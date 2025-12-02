import 'dotenv/config';
import { SampleBot } from './bot/bot';

async function bootstrap() {
    const bot = new SampleBot(process.env.BOT_TOKEN!);
    await bot.start();
}

bootstrap();
