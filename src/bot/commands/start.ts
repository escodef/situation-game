import { CommandContext, Context } from 'grammy';

export default {
    name: 'start',
    description: 'говно',
    execute: async (ctx: CommandContext<Context>) => {
        await ctx.reply('соси хуй быдло');
    },
};
