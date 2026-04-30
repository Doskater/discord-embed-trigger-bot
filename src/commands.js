import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const commandData = [
  new SlashCommandBuilder()
    .setName('trigger')
    .setDescription('Manage embed listener triggers.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add or replace a trigger.')
        .addStringOption((option) => option.setName('id').setDescription('Stable trigger id.').setRequired(true))
        .addStringOption((option) => option.setName('source_bot_id').setDescription('Third-party bot user id to watch.').setRequired(true))
        .addStringOption((option) => option.setName('phrase').setDescription('Case-insensitive phrase to match inside embeds.').setRequired(true))
        .addStringOption((option) => option.setName('response_title').setDescription('Embed reply title.').setRequired(true))
        .addStringOption((option) => option.setName('response_description').setDescription('Embed reply description.').setRequired(true))
        .addStringOption((option) => option.setName('ping_role_id').setDescription('Role id to ping when matched.').setRequired(false))
        .addStringOption((option) => option.setName('reaction_emoji').setDescription('Emoji reaction for the original embed.').setRequired(false))
        .addStringOption((option) => option.setName('channels').setDescription('Comma-separated channel ids. Empty means all channels.').setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('edit')
        .setDescription('Edit an existing trigger by replacing supplied fields.')
        .addStringOption((option) => option.setName('id').setDescription('Trigger id.').setRequired(true))
        .addStringOption((option) => option.setName('source_bot_id').setDescription('Third-party bot user id to watch.').setRequired(false))
        .addStringOption((option) => option.setName('phrase').setDescription('Case-insensitive phrase to match inside embeds.').setRequired(false))
        .addStringOption((option) => option.setName('response_title').setDescription('Embed reply title.').setRequired(false))
        .addStringOption((option) => option.setName('response_description').setDescription('Embed reply description.').setRequired(false))
        .addStringOption((option) => option.setName('ping_role_id').setDescription('Role id to ping when matched.').setRequired(false))
        .addStringOption((option) => option.setName('reaction_emoji').setDescription('Emoji reaction for the original embed.').setRequired(false))
        .addStringOption((option) => option.setName('channels').setDescription('Comma-separated channel ids. Empty means all channels.').setRequired(false))
        .addBooleanOption((option) => option.setName('enabled').setDescription('Enable or disable this trigger.').setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a trigger.')
        .addStringOption((option) => option.setName('id').setDescription('Trigger id.').setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('List configured triggers.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show bot runtime status and trigger count.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
].map((command) => command.toJSON());

export function requireAdminRole(interaction, adminRoleId) {
  if (!adminRoleId) return true;
  return interaction.member?.roles?.cache?.has(adminRoleId) === true;
}

export function parseChannelAllowlist(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.replace(/[<#>]/g, '').trim())
    .filter(Boolean);
}
