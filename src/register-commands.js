import { REST, Routes } from 'discord.js';
import { config, requireRuntimeConfig } from './config.js';
import { commandData } from './commands.js';

requireRuntimeConfig(['token', 'clientId', 'guildId']);

const rest = new REST({ version: '10' }).setToken(config.token);

await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
  body: commandData
});

console.log(`Registered ${commandData.length} slash command groups for guild ${config.guildId}.`);
