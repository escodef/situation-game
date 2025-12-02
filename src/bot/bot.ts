import * as fs from 'fs/promises';
import { Bot } from 'grammy';
import * as path from 'path';
import { pathToFileURL } from 'url';

export class SampleBot extends Bot {
    private readonly commands: Map<string, any> = new Map();

    constructor(token: string) {
        super(token);
        this.loadCommands();
    }

    async findFiles(folderPath: string): Promise<string[]> {
        const files = [];
        folderPath = path.isAbsolute(folderPath)
            ? folderPath
            : path.join(process.cwd(), folderPath);
        const folder = await fs.readdir(folderPath, { withFileTypes: true });

        for (const file of folder) {
            const pathFile = path.join(folderPath, file.name);
            if (file.isDirectory()) {
                files.push(...(await this.findFiles(pathFile)));
                continue;
            }
            files.push(pathFile);
        }
        return files;
    }

    async loadCommands(): Promise<void> {
        for (const file of await this.findFiles('./src/bot/commands/')) {
            const commandName = file
                .split(path.sep + 'commands' + path.sep)[1]
                .slice(0, -3);

            try {
                const fileUrl = pathToFileURL(file).href;
                const commandModule = await import(fileUrl);
                const commandInstance = commandModule.default;

                this.command(commandName, async (ctx) => {
                    await commandInstance.execute(ctx);
                });

                this.commands.set(commandName, commandInstance);

                console.log(`Комманда "${commandName}" успешно загружена!`);
            } catch (err) {
                console.error(
                    `Комманда ${commandName} не смогла запуститься. ${
                        err instanceof Error
                            ? err.message.split('\n')[0]
                            : 'Unknown error'
                    }`
                );
            }
        }
    }
}
