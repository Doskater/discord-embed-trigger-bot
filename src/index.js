import { Client, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js';
import { config, requireRuntimeConfig } from './config.js';
import { parseChannelAllowlist, requireAdminRole } from './commands.js';
import { findMatchingTriggers } from './matcher.js';
import { TriggerStore } from './store.js';

requireRuntimeConfig(['token', 'guildId']);

const store = new TriggerStore(config.triggerStorePath);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}. Watching embeds in guild ${config.guildId}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!requireAdminRole(interaction, config.adminRoleId)) {
    await interaction.reply({ content: 'This command is restricted to the configured admin role.', ephemeral: true });
    return;
  }

  try {
    if (interaction.commandName === 'trigger') {
      await handleTriggerCommand(interaction);
      return;
    }

    if (interaction.commandName === 'status') {
      const triggers = await store.list();
      await interaction.reply({
        content: `Online. ${triggers.length} trigger(s) configured. Admin role: ${config.adminRoleId ? `<@&${config.adminRoleId}>` : 'not set'}.`,
        ephemeral: true
      });
    }
  } catch (error) {
    console.error(error);
    const payload = { content: `Command failed: ${error.message}`, ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.guildId !== config.guildId) return;

  const triggers = await store.list();
  const matches = findMatchingTriggers(message, triggers);

  for (const trigger of matches) {
    await respondToMatch(message, trigger);
  }
});

async function handleTriggerCommand(interaction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'list') {
    const triggers = await store.list();
    await interaction.reply({ content: formatTriggerList(triggers), ephemeral: true });
    return;
  }

  if (subcommand === 'remove') {
    const id = interaction.options.getString('id', true);
    const removed = await store.remove(id);
    await interaction.reply({ content: removed ? `Removed trigger \`${id}\`.` : `No trigger found for \`${id}\`.`, ephemeral: true });
    return;
  }

  if (subcommand === 'add') {
    const trigger = buildTriggerFromInteraction(interaction);
    await store.upsert(trigger);
    await interaction.reply({ content: `Saved trigger \`${trigger.id}\`.`, ephemeral: true });
    return;
  }

  if (subcommand === 'edit') {
    const id = interaction.options.getString('id', true);
    const triggers = await store.list();
    const existing = triggers.find((trigger) => trigger.id === id);
    if (!existing) {
      await interaction.reply({ content: `No trigger found for \`${id}\`.`, ephemeral: true });
      return;
    }

    const edited = buildTriggerFromInteraction(interaction, existing);
    await store.upsert(edited);
    await interaction.reply({ content: `Updated trigger \`${id}\`.`, ephemeral: true });
  }
}

function buildTriggerFromInteraction(interaction, existing = {}) {
  const id = interaction.options.getString('id', true);
  return {
    id,
    sourceBotId: interaction.options.getString('source_bot_id') ?? existing.sourceBotId,
    phrase: interaction.options.getString('phrase') ?? existing.phrase,
    response: {
      title: interaction.options.getString('response_title') ?? existing.response?.title,
      description: interaction.options.getString('response_description') ?? existing.response?.description,
      color: existing.response?.color
    },
    pingRoleId: interaction.options.getString('ping_role_id') ?? existing.pingRoleId ?? '',
    reactionEmoji: interaction.options.getString('reaction_emoji') ?? existing.reactionEmoji ?? '',
    channelAllowlist: interaction.options.getString('channels') === null
      ? existing.channelAllowlist ?? []
      : parseChannelAllowlist(interaction.options.getString('channels')),
    enabled: interaction.options.getBoolean('enabled') ?? existing.enabled ?? true
  };
}

async function respondToMatch(message, trigger) {
  const embed = new EmbedBuilder()
    .setTitle(trigger.response.title)
    .setDescription(trigger.response.description)
    .setColor(trigger.response.color);

  if (trigger.pingRoleId) {
    await message.channel.send({ content: `<@&${trigger.pingRoleId}>`, embeds: [embed], allowedMentions: { roles: [trigger.pingRoleId] } });
  } else {
    await message.channel.send({ embeds: [embed] });
  }

  if (trigger.reactionEmoji) {
    await message.react(trigger.reactionEmoji);
  }
}

function formatTriggerList(triggers) {
  if (triggers.length === 0) return 'No triggers configured.';

  return triggers
    .map((trigger) => {
      const channels = trigger.channelAllowlist.length > 0 ? trigger.channelAllowlist.map((id) => `<#${id}>`).join(', ') : 'all channels';
      return `\`${trigger.id}\` watches bot \`${trigger.sourceBotId}\` for "${trigger.phrase}" in ${channels}.`;
    })
    .join('\n');
}

await client.login(config.token);
